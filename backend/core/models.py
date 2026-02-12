from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# ============================
# STUDENT
# ============================


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    roll_no = models.CharField(max_length=50, unique=True)

    institution_type = models.CharField(
        max_length=20,
        choices=(('school', 'School'), ('university', 'University'))
    )

    class_or_year = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)

    is_first_login = models.BooleanField(default=True)

    def __str__(self):
        return self.roll_no





# ============================
# TEACHER
# ============================
class Teacher(models.Model):
    INSTITUTION_CHOICES = (
        ('school', 'School'),
        ('university', 'University'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    institution_type = models.CharField(max_length=20, choices=INSTITUTION_CHOICES)
    department = models.CharField(max_length=100, blank=True, null=True)

    def clean(self):
        """
        Prevent Admin users from being assigned as Teachers.
        """
        if self.user.is_superuser:
            raise ValidationError(
                "Admin (superuser) accounts cannot be assigned as Teachers."
            )

    def save(self, *args, **kwargs):
        # Run validation every time before saving
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} ({self.institution_type})"


# ============================
# COURSE
# ============================
class Course(models.Model):
    LEVEL_CHOICES = (
        ('school', 'School'),
        ('university', 'University'),
    )

    name = models.CharField(max_length=200)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    year_or_class = models.CharField(max_length=100, blank=True, null=True)

    created_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)  # 🔥 ADMIN CONTROL

    def __str__(self):
        return f"{self.name} ({self.level})"


# ============================
# TOPIC
# ============================
class Topic(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='topics'
    )

    topic_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    difficulty = models.IntegerField(default=1)  # 1–5
    is_active = models.BooleanField(default=True)  # 🔥 ADMIN CONTROL

    def __str__(self):
        return f"{self.topic_name} - {self.course.name}"


# ============================
# STUDENT TOPIC SCORE
# ============================
class StudentTopicScore(models.Model):
    ASSESSMENT_TYPE_CHOICES = (
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('midsem', 'Mid-Sem Exam'),
        ('combined', 'Combined'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    assessment_type = models.CharField(
        max_length=20,
        choices=ASSESSMENT_TYPE_CHOICES
    )
    score = models.FloatField()  # 0–100
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.student.roll_no} - "
            f"{self.topic.topic_name} - "
            f"{self.assessment_type}: {self.score}"
        )
