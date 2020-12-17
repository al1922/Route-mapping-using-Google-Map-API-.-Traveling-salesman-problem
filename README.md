# Route mapping using Google Map API. Traveling salesman problem.

## General info

The subject of project is an application allowing to optimize the delivery route for different types of entities, e.g. food supplier, courier, medical equipment supply, etc. After obtaining data from the user, the application determines the optimal route between the points.<br />

If you have any questions, please feel free to write to me.<br />

Solver:
* https://github.com/hgourvest/glpk.js

More detail about Google Map API: 
* https://developers.google.com/maps/documentation

## Technologies
Project is created with:
* JavaScript
* CSS
* HTML
* GLPK (GNU Linear Programming Kit) 
* Google Map API:
  * Places API
  * Directions API
  * Maps JavaScript API

## Use 
Open <code>mapa.html</code>, find selected places using ***Search Box*** and add them to table and use ***Calculate*** to get score. The first added point is the place where we start and end the route calculation.

## Example 

Finding a route between five points, places in the city of Wroclaw:<br />
* Nabycińska 2, Wrocław, Polska 
* Grunwaldzka 2, Wrocław, Polska 
* Tadeusza Kościuszki 3, Wrocław, Polska 
* Czarnoleska 1, Wrocław, Polska 
* Zgodna 5, Wrocław, Polska 

As you can see, there is no "A" point on the map, it is hidden under the last point "F".

<img src="https://github.com/al1922/Route-mapping-using-Google-Map-API.-Traveling-salesman-problem/blob/main/README_IMG/route.png" width="600" height="500">

The overall appearance of the application.

<img src="https://github.com/al1922/Route-mapping-using-Google-Map-API.-Traveling-salesman-problem/blob/main/README_IMG/all_ap.png" width="800" height="350">


