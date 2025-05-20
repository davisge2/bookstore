from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0002_alter_bestselleraccolade_category'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='first_name',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='profile',
            name='last_name',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='profile',
            name='favorite_books',
            field=models.ManyToManyField(blank=True, to='catalog.book'),
        ),
    ]
