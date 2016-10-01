from django.shortcuts import render
from django.core import serializers
from django.http import JsonResponse,HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Avg,Max,Min,F,Q,Func
from django.core.cache import cache
from django.shortcuts import render
from django.template import RequestContext, loader
from math import ceil
import json
from .models import HotelDeals as Deals

def home(request):
    return render(request, 'base.html')

def hitter():
	hit = cache.get("api-hits")
	if hit is None:
		cache.set("api-hits",1)
	else:
		cache.set("api-hits",hit+1)

# Create your views here.
def _list(request):
	hitter()
	objects = Deals.objects.annotate(price=Func(F("actual_price") - ((F("actual_price") * F("discount"))/100), function='CEILING')).all()
	query = request.GET.get('query',None)
	if query is not None:
		objects = objects.filter(Q(location__contains = query) | Q(name__contains = query))
	_sort= request.GET.get('sortBy',None)
	if _sort is not None:
		if _sort in ["rating","price"]:
			objects = objects.order_by('-'+_sort)
	page = request.GET.get('page',None)
	if page is None:
		page = 1
	else:
		page = int(page)
	inc = (page - 1) * 6
	exc = (page * 6) 
	objects = objects[inc:exc]
	return HttpResponse(json.dumps(list(objects.values()), cls=DjangoJSONEncoder), content_type='application/json')

def search(request):
	hitter()
	query = request.GET.get('query',None)
	objects = Deals.objects.annotate(price=Func(F("actual_price") - ((F("actual_price") * F("discount"))/100), function='CEILING')).all()
	if query is not None:
		objects = objects.filter(Q(location__contains = query) | Q(name__contains = query))
	page = request.GET.get('page',None)
	if page is None:
		page = 1
	else:
		page = int(page)
	inc = (page - 1) * 6
	exc = (page * 6) 
	objects = objects[inc:exc]
	return HttpResponse(json.dumps(list(objects.values()), cls=DjangoJSONEncoder), content_type='application/json')


def stats(request):
	hitter()
	objects = Deals.objects.annotate(price=Func(F("actual_price") - ((F("actual_price") * F("discount"))/100), function='CEILING')).all()
	_count = objects.count()
	_avg = float("{0:.2f}".format(objects.aggregate(Avg('rating'))["rating__avg"]))
	_min = ceil(objects.aggregate(min=Min(F('actual_price') - ((F('actual_price')*F('discount'))/100)))["min"])
	_max = ceil(objects.aggregate(max=Max(F('actual_price') - ((F('actual_price')*F('discount'))/100)))["max"])
	_locations = set([i[0].split(',')[-2].lstrip() for i in objects.all().values_list('location')])
	distribution = {}
	for _location in _locations:
		distribution[_location] = objects.filter(location__contains = _location).count()
	data = {
		'total_count': _count,
		'average_rating': _avg,
		'api_hits': cache.get("api-hits"),
		'price': {
			'Minimum': _min,
			'Maximum': _max
		},
		'area_wise_hotel_distribution': distribution
	}
	return HttpResponse(json.dumps(data), content_type='application/json')
