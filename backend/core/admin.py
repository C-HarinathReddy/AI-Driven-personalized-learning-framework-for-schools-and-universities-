# backend/core/admin.py

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.core.exceptions import PermissionDenied

from .models import (
    Student,
    Teacher,
    Course,
    Topic,
    StudentTopicScore
)

# =====================================================
# 🔒 HARD SECURITY: Only SUPERUSERS can access admin
# =====================================================

class SuperUserOnlyAdmin(UserAdmin):
    def has_module_permission(self, request):
        return request.user.is_active and request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_superuser

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


admin.site.unregister(User)
admin.site.register(User, SuperUserOnlyAdmin)

# =====================================================
# STUDENT ADMIN
# =====================================================

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('roll_no', 'institution_type', 'is_first_login')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            user = User.objects.create_user(
                username=obj.roll_no,
                password="student@123"
            )
            obj.user = user
        super().save_model(request, obj, form, change)



# =====================================================
# TEACHER ADMIN (VISIBLE ONLY TO SUPERUSER)
# =====================================================

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "institution_type", "department")
    search_fields = ("user__username",)
    list_filter = ("institution_type", "department")

    def has_module_permission(self, request):
        return request.user.is_superuser


# =====================================================
# COURSE & TOPIC MANAGEMENT (ADMIN CORE FEATURE)
# =====================================================

class TopicInline(admin.TabularInline):
    model = Topic
    extra = 1
    fields = ("topic_name", "difficulty", "is_active")
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "level", "year_or_class", "created_by")
    list_filter = ("level", "year_or_class")
    search_fields = ("name",)
    inlines = [TopicInline]


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("id", "topic_name", "course", "difficulty", "is_active")
    list_filter = ("course", "difficulty", "is_active")
    search_fields = ("topic_name",)


# =====================================================
# STUDENT TOPIC SCORES (READ-ONLY ANALYTICS)
# =====================================================

@admin.register(StudentTopicScore)
class StudentTopicScoreAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "topic",
        "assessment_type",
        "score",
        "created_at"
    )
    list_filter = ("assessment_type", "topic__course")
    search_fields = ("student__roll_no", "topic__topic_name")
    readonly_fields = ("created_at",)
