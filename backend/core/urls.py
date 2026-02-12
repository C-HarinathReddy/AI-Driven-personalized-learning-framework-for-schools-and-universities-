from django.urls import path
from . import views
from .views import admin_login
from .views import (
    admin_login,
    admin_courses,
    admin_update_course,
    admin_topics,
    admin_update_topic,
)
from .views import student_login, student_change_password

urlpatterns = [

    # BASIC
    path("test/", views.test_api),

    # STUDENT
    path("student-login/", views.student_login),
    path("students/roll/<str:roll_no>/summary/", views.student_summary_by_roll),
    path("students/roll/<str:roll_no>/report/", views.student_pdf_report),
    path("student-change-password/", student_change_password),

    # TEACHER
    path("upload/", views.upload_assessment),
    path("me/", views.current_user),
    path("courses/", views.list_courses),
    path("courses/<int:course_id>/topics/", views.list_topics_by_course),
    path("courses/<int:course_id>/class-summary/", views.class_summary),
    path("courses/<int:course_id>/class-report/", views.class_pdf_report),
    path("courses/<int:course_id>/students-overview/", views.course_students_overview),
    
    # ================= TEACHER MANAGEMENT =================
    path("teacher/my-courses/", views.teacher_my_courses),
    path("teacher/courses/", views.teacher_courses),
    path("teacher/courses/create/", views.teacher_create_course),
    path("teacher/courses/<int:course_id>/toggle/", views.teacher_toggle_course),
    path("teacher/courses/<int:course_id>/delete/", views.teacher_delete_course),

    path("teacher/topics/", views.teacher_topics),
    path("teacher/topics/create/", views.teacher_create_topic),
    path("teacher/topics/<int:topic_id>/edit/", views.teacher_update_topic),
    path("teacher/topics/<int:topic_id>/toggle/", views.teacher_toggle_topic),
    path("teacher/topics/<int:topic_id>/delete/", views.teacher_delete_topic),
    


    # ADMIN AUTH
    path("auth/admin-login/", views.admin_login),


    # ADMIN COURSES
    path("admin/courses/", admin_courses),
    path("admin/courses/<int:course_id>/edit/", admin_update_course),
    path("admin/courses/<int:course_id>/", admin_update_course),
    

    # ADMIN TOPICS
    path("admin/topics/", admin_topics),
    path("admin/topics/<int:topic_id>/edit/", admin_update_topic),
    path("admin/topics/<int:topic_id>/", admin_update_topic),
        # ================= ADMIN – TEACHERS =================
    path("admin/teachers/", views.admin_teachers),
    path("admin/teachers/create/", views.admin_create_teacher),
    path("admin/teachers/<int:teacher_id>/delete/", views.admin_delete_teacher),

    # ================= ADMIN – STUDENTS =================
    path("admin/students/", views.admin_students),
    path("admin/students/create/", views.admin_create_student),
    path("admin/students/<int:student_id>/delete/", views.admin_delete_student),
    
]
