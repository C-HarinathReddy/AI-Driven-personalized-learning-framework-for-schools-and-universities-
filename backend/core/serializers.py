# AI-Learning-System\backend\core\serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, Teacher, Course, Topic, StudentTopicScore


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'level', 'year_or_class']


class TopicSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = "__all__"


class StudentTopicScoreSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    topic = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = StudentTopicScore
        fields = ['id', 'student', 'topic', 'assessment_type', 'score', 'created_at']
