from django.http import JsonResponse

def index(request):
    return JsonResponse({'status': 'mock', 'app': 'notifications'})
