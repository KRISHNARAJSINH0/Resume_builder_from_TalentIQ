"""
TalentIQ Resume Module — Migration 0003: Remove QR Feature
============================================================
Drops:
  - resume_qranalytics table
  - resume.qr_url column
  - resume.qr_scan_count column
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resume', '0002_normalized_schema'),
    ]

    operations = [
        # Drop the QRAnalytics table
        migrations.DeleteModel(
            name='QRAnalytics',
        ),

        # Remove qr_url field from Resume
        migrations.RemoveField(
            model_name='resume',
            name='qr_url',
        ),

        # Remove qr_scan_count field from Resume
        migrations.RemoveField(
            model_name='resume',
            name='qr_scan_count',
        ),
    ]
