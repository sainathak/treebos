from django.conf.urls import url, include
from hotels import views as hotels_view

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^list/$', hotels_view._list),
    url(r'^stats/$', hotels_view.stats),
    url(r'^search/$', hotels_view.search),
    url(r'^$', hotels_view.home),
]