from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "online",
        "name": "TalentIQ API Engine",
        "version": "1.0.0",
        "message": "Welcome to TalentIQ Resume Intelligence Engine Backend Services."
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/resume/', include('apps.resume.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/gap/', include('apps.gap_analysis.urls')),
    path('api/recommend/', include('apps.recommendations.urls')),
    path('api/salary/', include('apps.salary.urls')),
    path('api/interview/', include('apps.interview.urls')),
    path('api/readiness/', include('apps.readiness.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]

# Serve media files (profile photos, QR codes) in development.
# In production, configure your web server (Nginx/S3) to serve MEDIA_ROOT.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
