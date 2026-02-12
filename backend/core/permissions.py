from rest_framework.permissions import BasePermission
from core.models import Teacher

class IsSuperAdmin(BasePermission):
    """
    Allows access ONLY to Django superusers (system admin).
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and Teacher.objects.filter(user=request.user).exists()