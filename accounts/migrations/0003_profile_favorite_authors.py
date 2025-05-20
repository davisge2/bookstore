from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0002_alter_bestselleraccolade_category'),
        ('accounts', '0002_profile_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='favorite_authors',
            field=models.ManyToManyField(blank=True, to='catalog.author'),
        ),
    ]
