var map;
function init()
{
	map = L.map("map").setView([40.777073,-73.94934],10);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}',{foo:'bar'}).addTo(map);
	

}