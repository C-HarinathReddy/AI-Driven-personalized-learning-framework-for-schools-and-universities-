#\Users\Hari9\Desktop\AI-Learning-System\backend\core\views.py
import pandas as pd
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Course, Topic, StudentTopicScore, Student, Teacher
from .serializers import CourseSerializer, TopicSerializer, StudentTopicScoreSerializer
from io import BytesIO
from django.http import HttpResponse

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib import colors
from django.contrib.auth import authenticate
from .permissions import IsSuperAdmin
from .permissions import IsTeacher


DEFAULT_STUDENT_PASSWORD = "student@123"


# ------------------------------------------------------------
# BASIC TEST API
# ------------------------------------------------------------

@api_view(['GET'])
def test_api(request):
    return Response({
        "message": "AI Learning System Backend is Working!",
        "status": "success"
    })


# ------------------------------------------------------------
# COURSE & TOPIC LIST
# ------------------------------------------------------------

@api_view(['GET'])
def list_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def list_topics_by_course(request, course_id):
    topics = Topic.objects.filter(course_id=course_id, is_active=True)
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def list_student_topic_scores(request, student_id):
    scores = StudentTopicScore.objects.filter(student_id=student_id).order_by('-created_at')
    serializer = StudentTopicScoreSerializer(scores, many=True)
    return Response(serializer.data)


# ------------------------------------------------------------
# HELPER: AI recommendation text
# ------------------------------------------------------------

def build_ai_recommendation(overall_prediction, weak_topics, strong_topics):
    weak_str = ", ".join(weak_topics) if weak_topics else "none"
    strong_str = ", ".join(strong_topics) if strong_topics else "none"

    lines = []

    # Overall status
    if overall_prediction < 40:
        lines.append(
            f"Your current predicted final exam score is about {overall_prediction}%. "
            "This suggests that you need to strengthen your fundamentals and focus more on regular practice."
        )
    elif overall_prediction < 70:
        lines.append(
            f"Your predicted final exam score is about {overall_prediction}%. "
            "You are on the right track, but there is still good scope to improve and push your score higher."
        )
    else:
        lines.append(
            f"Great work! Your predicted final exam score is about {overall_prediction}%. "
            "You are performing well, but you should still revise key topics to maintain this level."
        )

    # Weak topics advice
    if weak_topics:
        lines.append(
            f"Weak topics identified: {weak_str}. "
            "Start with these topics first. Revisit your class notes, watch short concept videos, "
            "and try a few simple practice questions before attempting complex problems."
        )

    # Strong topics advice
    if strong_topics:
        lines.append(
            f"Strong topics: {strong_str}. "
            "Use these topics to boost your overall score. You can attempt higher-level questions here, "
            "or help your friends to explain these concepts (teaching others also improves your understanding)."
        )

    # Generic study plan
    lines.append(
        "Recommended 3-step plan for the next few days:\n"
        "1) Pick one weak topic each day and spend 30–45 minutes revising the core concepts.\n"
        "2) Solve at least 5–10 mixed questions (quiz/previous year questions) on that topic.\n"
        "3) At the end of the week, take a small self-test on all topics to check your improvement."
    )

    lines.append(
        "Try to maintain a consistent study schedule instead of last-minute preparation. "
        "Even small, daily progress will significantly improve your final exam performance."
    )

    return "\n\n".join(lines)


# ------------------------------------------------------------
# SHARED SUMMARY COMPUTATION
# ------------------------------------------------------------

def generate_student_summary(student):
    """
    Common summary logic used by:
    - student_summary (by numeric id)
    - student_summary_by_roll (by roll_no)
    - course_students_overview (teacher view)
    """
    scores = StudentTopicScore.objects.filter(student=student)

    if not scores.exists():
        return {
            "student_id": student.id,
            "student_name": student.user.username,
            "overall_predicted_final_score": 0,
            "topics": [],
            "weak_topics": [],
            "strong_topics": [],
            "ai_recommendation": (
                "No assessment data available yet. Once quizzes, assignments or mid-sem marks are uploaded, "
                "an AI-based learning plan will be generated for this student."
            ),
        }

    topic_data = {}

    for s in scores:
        t = s.topic
        if t.id not in topic_data:
            topic_data[t.id] = {
                "topic": t,
                "quiz_scores": [],
                "assignment_scores": [],
                "midsem_scores": [],
            }

        if s.assessment_type == "quiz":
            topic_data[t.id]["quiz_scores"].append(s.score)
        elif s.assessment_type == "assignment":
            topic_data[t.id]["assignment_scores"].append(s.score)
        elif s.assessment_type == "midsem":
            topic_data[t.id]["midsem_scores"].append(s.score)

    def avg(lst):
        return sum(lst) / len(lst) if lst else 0.0

    topics_summary = []
    weak_topics = []
    strong_topics = []
    total_combined = 0.0
    topic_count = 0

    for topic_id, data in topic_data.items():
        t = data["topic"]

        quiz_avg = avg(data["quiz_scores"])
        assignment_avg = avg(data["assignment_scores"])
        midsem_avg = avg(data["midsem_scores"])

        combined_score = (
            0.25 * quiz_avg +
            0.25 * assignment_avg +
            0.50 * midsem_avg
        )

        if combined_score >= 80:
            level = "Strong"
            strong_topics.append(t.topic_name)
        elif combined_score >= 50:
            level = "Average"
        else:
            level = "Weak"
            weak_topics.append(t.topic_name)

        topics_summary.append({
            "topic_id": t.id,
            "topic_name": t.topic_name,
            "course_name": t.course.name,
            "quiz_avg": round(quiz_avg, 2),
            "assignment_avg": round(assignment_avg, 2),
            "midsem_avg": round(midsem_avg, 2),
            "combined_score": round(combined_score, 2),
            "level": level,
        })

        total_combined += combined_score
        topic_count += 1

    overall_prediction = total_combined / topic_count if topic_count > 0 else 0.0
    overall_prediction = round(overall_prediction, 2)

    ai_recommendation = build_ai_recommendation(
        overall_prediction, weak_topics, strong_topics
    )

    return {
        "student_id": student.id,
        "student_name": student.user.username,
        "overall_predicted_final_score": overall_prediction,
        "topics": topics_summary,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "ai_recommendation": ai_recommendation,
    }


# ------------------------------------------------------------
# STUDENT SUMMARY ENDPOINTS
# ------------------------------------------------------------

@api_view(['GET'])
def student_summary(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    summary = generate_student_summary(student)
    return Response(summary)


@api_view(['GET'])
def student_summary_by_roll(request, roll_no):
    student = get_object_or_404(Student, roll_no=roll_no)
    summary = generate_student_summary(student)
    return Response(summary)


@api_view(['GET'])
def student_pdf_report(request, roll_no):
    student = get_object_or_404(Student, roll_no=roll_no)
    summary = generate_student_summary(student)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    title = Paragraph(
        "<b>AI Learning Report – Student</b>",
        styles["Title"]
    )
    elements.append(title)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(
        f"<b>Student Name:</b> {summary['student_name']}<br/>"
        f"<b>Roll No:</b> {student.roll_no}<br/>"
        f"<b>Predicted Final Score:</b> {summary['overall_predicted_final_score']}%",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 14))

    # Topic Table
    table_data = [
        ["Topic", "Quiz Avg", "Assignment Avg", "Midsem Avg", "Combined", "Level"]
    ]

    for t in summary["topics"]:
        table_data.append([
            t["topic_name"],
            t["quiz_avg"],
            t["assignment_avg"],
            t["midsem_avg"],
            t["combined_score"],
            t["level"],
        ])

    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 16))

    # AI Recommendation
    elements.append(Paragraph("<b>AI Learning Plan</b>", styles["Heading2"]))
    for para in summary["ai_recommendation"].split("\n\n"):
        elements.append(Paragraph(para, styles["Normal"]))
        elements.append(Spacer(1, 8))

    doc.build(elements)

    buffer.seek(0)
    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="student_ai_report_{student.roll_no}.pdf"'
    )
    return response


# ------------------------------------------------------------
# STUDENT LOGIN (ROLL NO → JWT)
# ------------------------------------------------------------

@api_view(["POST"])
def student_login(request):
    roll_no = request.data.get("roll_no")
    password = request.data.get("password")

    user = authenticate(username=roll_no, password=password)

    if not user:
        return Response({"error": "Invalid credentials"}, status=400)

    student = Student.objects.get(user=user)

    return Response({
        "student_id": student.id,
        "roll_no": student.roll_no,
        "is_first_login": student.is_first_login,
        "logged_in": True   # ✅ ADD THIS
    })


@api_view(["POST"])
def student_change_password(request):
    roll_no = request.data.get("roll_no")
    password = request.data.get("password")

    if not roll_no or not password:
        return Response({"error": "Missing data"}, status=400)

    try:
        student = Student.objects.get(roll_no=roll_no)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    user = student.user
    user.set_password(password)
    user.save()

    student.is_first_login = False
    student.save()

    return Response({"message": "Password updated successfully"})





# ------------------------------------------------------------
# UPLOAD ASSESSMENTS (QUIZ / ASSIGNMENT / MIDSEM)
# ------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # teacher must be logged in
@parser_classes([MultiPartParser, FormParser])
def upload_assessment(request):
    if request.method == 'GET':
        return Response({"detail": "Use POST with assessment_type and file to upload data."})

    assessment_type = request.data.get('assessment_type')
    file_obj = request.FILES.get('file')

    if not assessment_type or not file_obj:
        return Response({"error": "assessment_type and file are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Read CSV/Excel into pandas
    try:
        if file_obj.name.endswith('.csv'):
            df = pd.read_csv(file_obj)
        else:
            df = pd.read_excel(file_obj)
    except Exception as e:
        return Response({"error": f"Error reading file: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST)

    # QUIZ & ASSIGNMENT
    if assessment_type in ['quiz', 'assignment']:

        required = ['student_id', 'student_name', 'topic_name', 'score']
        if any(col not in df.columns for col in required):
            return Response({"error": "Missing required columns."},
                            status=status.HTTP_400_BAD_REQUEST)

        for _, row in df.iterrows():
            user, _ = User.objects.get_or_create(
                username=str(row['student_id']),
                defaults={'first_name': str(row['student_name'])}
            )

            student, _ = Student.objects.get_or_create(
                user=user,
                defaults={
                    'institution_type': 'university',
                    'roll_no': str(row['student_id']),
                    'class_or_year': '',
                    'department': '',
                }
            )

            try:
                topic = Topic.objects.get(topic_name=str(row['topic_name']))
            except Topic.DoesNotExist:
                continue

            StudentTopicScore.objects.create(
                student=student,
                topic=topic,
                assessment_type=assessment_type,
                score=float(row['score'])
            )

        return Response({"message": f"{assessment_type.capitalize()} data uploaded successfully."},
                        status=status.HTTP_201_CREATED)

    # MIDSEM
    if assessment_type == 'midsem':

        required_cols = ['student_id', 'student_name'] + [f"q{i}" for i in range(1, 12)]
        if any(col not in df.columns for col in required_cols):
            return Response({"error": "Missing required columns for midsem."},
                            status=status.HTTP_400_BAD_REQUEST)

        import json
        mapping_raw = request.data.get('question_topic_mapping')
        if not mapping_raw:
            return Response({"error": "question_topic_mapping required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            question_topic_mapping = json.loads(mapping_raw)
        except Exception:
            return Response({"error": "Invalid JSON for question_topic_mapping"},
                            status=status.HTTP_400_BAD_REQUEST)

        for _, row in df.iterrows():

            user, _ = User.objects.get_or_create(
                username=str(row['student_id']),
                defaults={'first_name': str(row['student_name'])}
            )

            student, _ = Student.objects.get_or_create(
                user=user,
                defaults={
                    'institution_type': 'university',
                    'roll_no': str(row['student_id']),
                    'class_or_year': '',
                    'department': '',
                }
            )

            topic_marks = {}

            for q in range(1, 12):
                q_col = f"q{q}"
                obtained = float(row[q_col])

                if 1 <= q <= 5:
                    max_marks = 2
                elif 6 <= q <= 9:
                    max_marks = 5
                else:
                    max_marks = 10

                topic_id = question_topic_mapping.get(q_col)
                if not topic_id:
                    continue

                if topic_id not in topic_marks:
                    topic_marks[topic_id] = {"obtained": 0, "total": 0}

                topic_marks[topic_id]["obtained"] += obtained
                topic_marks[topic_id]["total"] += max_marks

            for topic_id, marks in topic_marks.items():
                topic = Topic.objects.filter(id=topic_id).first()
                if not topic:
                    continue

                percent = (marks['obtained'] / marks['total']) * 100

                StudentTopicScore.objects.create(
                    student=student,
                    topic=topic,
                    assessment_type="midsem",
                    score=percent
                )

        return Response({"message": "Mid-Sem data uploaded successfully."},
                        status=status.HTTP_201_CREATED)

    return Response({"error": "Invalid assessment_type."},
                    status=status.HTTP_400_BAD_REQUEST)


# ------------------------------------------------------------
# CLASS SUMMARY + COURSE STUDENT OVERVIEW
# ------------------------------------------------------------

@api_view(['GET'])
def class_summary(request, course_id):
    """
    Class-level analytics for a course:
    - Average quiz / assignment / midsem per topic
    - Combined score per topic
    - Weak / Average / Strong student counts per topic
    - Hardest & easiest topics
    - Top & weakest student
    - AI-style recommendation text
    """
    course = get_object_or_404(Course, id=course_id)
    scores = StudentTopicScore.objects.filter(topic__course=course)

    if not scores.exists():
        return Response({
            "course_id": course.id,
            "course_name": course.name,
            "message": "No scores available for this course yet."
        })

    total_students = scores.values('student_id').distinct().count()

    topic_data = {}
    student_ids_set = set()

    for s in scores:
        t = s.topic
        topic_id = t.id
        student_id = s.student_id
        student_ids_set.add(student_id)

        if topic_id not in topic_data:
            topic_data[topic_id] = {
                "topic": t,
                "quiz_scores": [],
                "assignment_scores": [],
                "midsem_scores": [],
                "per_student": {}
            }

        data = topic_data[topic_id]

        if s.assessment_type == "quiz":
            data["quiz_scores"].append(s.score)
        elif s.assessment_type == "assignment":
            data["assignment_scores"].append(s.score)
        elif s.assessment_type == "midsem":
            data["midsem_scores"].append(s.score)

        if student_id not in data["per_student"]:
            data["per_student"][student_id] = {
                "quiz": [],
                "assignment": [],
                "midsem": []
            }

        ps = data["per_student"][student_id]
        if s.assessment_type == "quiz":
            ps["quiz"].append(s.score)
        elif s.assessment_type == "assignment":
            ps["assignment"].append(s.score)
        elif s.assessment_type == "midsem":
            ps["midsem"].append(s.score)

    def avg(lst):
        return sum(lst) / len(lst) if lst else 0.0

    topics_summary = []
    total_combined_across_topics = 0.0
    topic_count = 0

    hardest_topics = []
    easiest_topics = []

    # compute per-topic averages
    for topic_id, data in topic_data.items():
        t = data["topic"]

        quiz_avg = avg(data["quiz_scores"])
        assignment_avg = avg(data["assignment_scores"])
        midsem_avg = avg(data["midsem_scores"])

        combined_avg = (
            0.25 * quiz_avg +
            0.25 * assignment_avg +
            0.50 * midsem_avg
        )

        weak_count = 0
        average_count = 0
        strong_count = 0

        for student_id, ps in data["per_student"].items():
            sq = avg(ps["quiz"])
            sa = avg(ps["assignment"])
            sm = avg(ps["midsem"])
            student_combined = 0.25 * sq + 0.25 * sa + 0.50 * sm

            if student_combined >= 80:
                strong_count += 1
            elif student_combined >= 50:
                average_count += 1
            else:
                weak_count += 1

        topics_summary.append({
            "topic_id": t.id,
            "topic_name": t.topic_name,
            "course_name": t.course.name,
            "quiz_avg": round(quiz_avg, 2),
            "assignment_avg": round(assignment_avg, 2),
            "midsem_avg": round(midsem_avg, 2),
            "combined_avg": round(combined_avg, 2),
            "weak_count": weak_count,
            "average_count": average_count,
            "strong_count": strong_count,
        })

        total_combined_across_topics += combined_avg
        topic_count += 1

    class_overall_score = total_combined_across_topics / topic_count if topic_count > 0 else 0.0
    class_overall_score = round(class_overall_score, 2)

    # hardest / easiest topics (by combined_avg)
    sorted_topics = sorted(
        topics_summary, key=lambda t: t["combined_avg"]
    )
    if sorted_topics:
        hardest_topics = [t["topic_name"] for t in sorted_topics[:3]]
        easiest_topics = [t["topic_name"] for t in sorted_topics[-3:]]

    # top & weakest student (by own summary)
    top_student = None
    weakest_student = None
    top_score_val = -1
    weak_score_val = 101

    for sid in student_ids_set:
        student = Student.objects.filter(id=sid).first()
        if not student:
            continue
        summary = generate_student_summary(student)
        score_val = summary["overall_predicted_final_score"]

        info = {
            "student_id": student.id,
            "roll_no": student.roll_no,
            "username": student.user.username,
            "predicted_score": score_val,
        }

        if score_val > top_score_val:
            top_score_val = score_val
            top_student = info

        if score_val < weak_score_val:
            weak_score_val = score_val
            weakest_student = info

    # AI recommendation for class
    hard_str = ", ".join(hardest_topics) if hardest_topics else "none"
    easy_str = ", ".join(easiest_topics) if easiest_topics else "none"

    ai_lines = [
        f"For the course '{course.name}', the overall class performance is around {class_overall_score}%. "
        "The class is performing at an average level with clear scope for improvement.",
    ]

    if hardest_topics:
        ai_lines.append(
            f"Topics where students are facing the most difficulty: {hard_str}. "
            "These topics should be revised in class using more examples, visual explanations, "
            "and additional practice problems."
        )

    if easiest_topics:
        ai_lines.append(
            f"Topics where students are performing well: {easy_str}. "
            "These can be used for advanced problem discussions, or as a base for assigning group projects "
            "and peer-learning activities."
        )

    if top_student:
        ai_lines.append(
            f"Top performing student currently: {top_student['username']} "
            f"(Roll No: {top_student['roll_no']}), with a predicted score of about {top_student['predicted_score']}%."
        )

    if weakest_student:
        ai_lines.append(
            f"Student needing maximum support: {weakest_student['username']} "
            f"(Roll No: {weakest_student['roll_no']}), with a predicted score near {weakest_student['predicted_score']}%. "
            "It is recommended to provide one-on-one guidance or targeted remedial sessions for this student."
        )

    ai_lines.append(
        "Suggested teacher actions for the next few classes:\n"
        "1) Start each session with a 5–10 minute quick recap quiz on weak topics.\n"
        "2) Provide at least one solved example and one practice question for each difficult concept.\n"
        "3) Encourage students to form small study groups where strong students can help weaker ones."
    )

    ai_recommendation = "\n\n".join(ai_lines)

    result = {
        "course_id": course.id,
        "course_name": course.name,
        "total_students": total_students,
        "class_overall_score": class_overall_score,
        "topics": topics_summary,
        "hardest_topics": hardest_topics,
        "easiest_topics": easiest_topics,
        "top_student": top_student,
        "weakest_student": weakest_student,
        "ai_recommendation": ai_recommendation,
    }

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_pdf_report(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    # Reuse existing logic
    data = class_summary(request, course_id).data

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(
        f"<b>AI Class Performance Report</b>",
        styles["Title"]
    ))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(
        f"<b>Course:</b> {data['course_name']}<br/>"
        f"<b>Total Students:</b> {data['total_students']}<br/>"
        f"<b>Class Predicted Score:</b> {data['class_overall_score']}%",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 14))

    table_data = [
        ["Topic", "Quiz Avg", "Assignment Avg", "Midsem Avg", "Combined Avg"]
    ]

    for t in data["topics"]:
        table_data.append([
            t["topic_name"],
            t["quiz_avg"],
            t["assignment_avg"],
            t["midsem_avg"],
            t["combined_avg"],
        ])

    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("<b>AI Teacher Recommendation</b>", styles["Heading2"]))
    for para in data["ai_recommendation"].split("\n\n"):
        elements.append(Paragraph(para, styles["Normal"]))
        elements.append(Spacer(1, 8))

    doc.build(elements)

    buffer.seek(0)
    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="class_ai_report_{course.id}.pdf"'
    )
    return response




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_students_overview(request, course_id):
    """
    List students for a course + their predicted scores.
    Used in Teacher 'Students' page.
    """
    course = get_object_or_404(Course, id=course_id)
    scores = StudentTopicScore.objects.filter(topic__course=course)

    if not scores.exists():
        return Response({
            "course_id": course.id,
            "course_name": course.name,
            "students": [],
        })

    student_ids = (
        scores.values_list('student_id', flat=True).distinct()
    )

    students_data = []
    for sid in student_ids:
        student = Student.objects.filter(id=sid).first()
        if not student:
            continue
        summary = generate_student_summary(student)
        students_data.append({
            "student_id": student.id,
            "username": student.user.username,
            "roll_no": student.roll_no,
            "overall_predicted_final_score": summary["overall_predicted_final_score"],
            "weak_topics": summary["weak_topics"],
            "strong_topics": summary["strong_topics"],
        })

    return Response({
        "course_id": course.id,
        "course_name": course.name,
        "students": students_data,
    })


# ------------------------------------------------------------
# CURRENT USER
# ------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    if user.is_superuser:
        role = "admin"
    elif user.is_staff:
        role = "teacher"
    else:
        role = "student"

    return Response({
        "username": user.username,
        "first_name": user.first_name,
        "role": role,
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    if not user.is_superuser:
        return Response({"error": "Admin access only"}, status=403)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": "admin",
        "username": user.username,
    })






@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_courses(request):

    if request.method == "GET":
        courses = Course.objects.all().order_by("name")
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    serializer = CourseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_update_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    if request.method == "PATCH":
        course.is_active = request.data.get("is_active", course.is_active)
        course.save()
        return Response(CourseSerializer(course).data)

    if request.method == "DELETE":
        course.delete()
        return Response({"message": "Course deleted"})



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_topics(request):

    if request.method == "GET":
        topics = Topic.objects.select_related("course")
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)

    # ✅ FIX HERE
    course_id = request.data.get("course")
    topic_name = request.data.get("topic_name")
    difficulty = request.data.get("difficulty", 1)

    if not course_id or not topic_name:
        return Response({"error": "Missing fields"}, status=400)

    course = get_object_or_404(Course, id=course_id)

    topic = Topic.objects.create(
        topic_name=topic_name,
        course=course,
        difficulty=difficulty
    )

    return Response(TopicSerializer(topic).data, status=201)



@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_update_topic(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)

    if request.method == "PATCH":
        topic.is_active = request.data.get("is_active", topic.is_active)
        topic.save()
        return Response(TopicSerializer(topic).data)

    if request.method == "DELETE":
        topic.delete()
        return Response({"message": "Topic deleted"})




from core.models import Teacher, Student
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_teachers(request):
    teachers = Teacher.objects.select_related("user")
    data = [{
        "id": t.id,
        "username": t.user.username,
        "institution_type": t.institution_type,
        "department": t.department,
    } for t in teachers]

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_create_teacher(request):
    username = request.data.get("username")
    password = request.data.get("password")
    institution_type = request.data.get("institution_type")
    department = request.data.get("department", "")

    if not all([username, password, institution_type]):
        return Response({"error": "Missing required fields"}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password,
        is_staff=True
    )

    Teacher.objects.create(
        user=user,
        institution_type=institution_type,
        department=department
    )

    return Response({"message": "Teacher created"}, status=201)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_delete_teacher(request, teacher_id):
    teacher = get_object_or_404(Teacher, id=teacher_id)
    teacher.user.delete()  # deletes both user + teacher
    return Response({"message": "Teacher deleted"})



@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_students(request):
    students = Student.objects.select_related("user").all()
    data = [{
        "id": s.id,
        "username": s.user.username,
        "roll_no": s.roll_no,
        "institution_type": s.institution_type,
        "class_or_year": s.class_or_year,
        "department": s.department,
    } for s in students]

    return Response(data)




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_student(request):
    roll_no = request.data.get("roll_no")
    institution_type = request.data.get("institution_type")
    class_or_year = request.data.get("class_or_year")
    department = request.data.get("department")

    if not roll_no or not institution_type:
        return Response({"error": "Missing required fields"}, status=400)

    # ✅ 1. Check Student duplicate
    if Student.objects.filter(roll_no=roll_no).exists():
        return Response({"error": "Student already exists"}, status=400)

    # ✅ 2. Check User duplicate
    if User.objects.filter(username=roll_no).exists():
        return Response({"error": "User already exists"}, status=400)

    # ✅ 3. Create user (roll_no = username)
    user = User.objects.create_user(
        username=roll_no,
        password="student@123"
    )

    # ✅ 4. Create student profile
    student = Student.objects.create(
        user=user,
        roll_no=roll_no,
        institution_type=institution_type,
        class_or_year=class_or_year,
        department=department,
        is_first_login=True
    )

    return Response({
        "id": student.id,
        "username": user.username,
        "roll_no": student.roll_no,
        "institution_type": student.institution_type,
        "class_or_year": student.class_or_year,
        "department": student.department,
    }, status=201)

    
    

@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_delete_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    student.user.delete()
    return Response({"message": "Student deleted"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_my_courses(request):
    if not hasattr(request.user, "teacher"):
        return Response({"detail": "Teacher only"}, status=403)

    courses = Course.objects.filter(created_by=request.user.teacher)
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_topics(request):
    teacher = request.user.teacher

    # ---------- GET ----------
    if request.method == "GET":
        topics = Topic.objects.filter(course__created_by=teacher)
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)

    # ---------- POST ----------
    topic_name = request.data.get("topic_name")
    course_id = request.data.get("course")

    if not topic_name or not course_id:
        return Response({"error": "Missing fields"}, status=400)

    course = get_object_or_404(
        Course,
        id=course_id,
        created_by=teacher
    )

    topic = Topic.objects.create(
        course=course,
        topic_name=topic_name,
        active=True
    )

    serializer = TopicSerializer(topic)
    return Response(serializer.data, status=201)




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def teacher_create_topic(request):
    teacher = Teacher.objects.get(user=request.user)
    course_id = request.data.get("course")

    course = get_object_or_404(Course, id=course_id, created_by=teacher)

    serializer = TopicSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(course=course)

    return Response(serializer.data, status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_update_topic(request, topic_id):
    topic = get_object_or_404(
        Topic,
        id=topic_id,
        course__created_by=request.user.teacher
    )

    serializer = TopicSerializer(topic, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def teacher_toggle_topic(request, topic_id):
    if not hasattr(request.user, "teacher"):
        return Response({"detail": "Teacher only"}, status=403)

    topic = get_object_or_404(
        Topic,
        id=topic_id,
        course__created_by=request.user.teacher
    )

    topic.is_active = not topic.is_active
    topic.save()

    return Response({
        "id": topic.id,
        "is_active": topic.is_active
    })

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def teacher_delete_topic(request, topic_id):
    if not hasattr(request.user, "teacher"):
        return Response({"detail": "Teacher only"}, status=403)

    topic = get_object_or_404(
        Topic,
        id=topic_id,
        course__created_by=request.user.teacher
    )

    topic.delete()
    return Response({"message": "Topic deleted"})




@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_courses(request):
    teacher = request.user.teacher

    if request.method == "GET":
        courses = Course.objects.filter(created_by=teacher)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    serializer = CourseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(created_by=teacher)
    return Response(serializer.data, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def teacher_create_course(request):
    teacher = Teacher.objects.get(user=request.user)

    serializer = CourseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(created_by=teacher)

    return Response(serializer.data, status=201)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def teacher_toggle_course(request, course_id):
    teacher = request.user.teacher

    course = get_object_or_404(
        Course,
        id=course_id,
        created_by=teacher
    )

    course.is_active = not course.is_active
    course.save()

    return Response({
        "id": course.id,
        "is_active": course.is_active
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def teacher_delete_course(request, course_id):
    teacher = request.user.teacher

    course = get_object_or_404(
        Course,
        id=course_id,
        created_by=teacher
    )

    course.delete()
    return Response({"message": "Course deleted"})


