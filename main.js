function initAutocomplete() {

  var directionsService = new google.maps.DirectionsService();

  // Stworzenie początkowej mapy oraz nakierowanie jej na Polskę
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 52, lng: 19 },
    zoom: 6,
    mapTypeId: "roadmap",
  });

  // Połączenie wyszukiwarki z interfejsem googl'a
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // Prezentacja wyników wyszukiwania
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  // Tabela z punktami wyszukiwania 
  let markers = []; 

  // Czekanie na zdarzenie, kiedy użytwkonik wypełni polę w celu pokazania
  // większej ilośći szczegółów na temat tego miejsca
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Usuwanie starych puntktów 
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // Dla każdego miejsca wyświetl ikonę, nazwę i lokalizację
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Dodanie punktu i wyświetlenie na mapie
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

    });
    map.fitBounds(bounds);
    
  });
  
  // Tabela z dodanymi miejscami
  var table = [];  

  // Dodanie elementów do tabeli 
  document.getElementById("send-data").addEventListener('click', function() { 
    if(input.value != "" && table.includes(input.value) == false ){
      
      //Dodanie wyszukiwanego miejsca do tabeli
      table.push(input.value); 

      // Stworzenie i przerzucenie danych do html w celu prezentacji danych i manipulacji na nich.
      const tableBody = document.getElementById('table-data'); 
      let dataHtml = '' ; 
      for (let element of table ){
        dataHtml += '<tr id="'+ element +'" > <td class="elemenet"> '+ element +' </td> <td class="btn-delete" id="'+ element +'" > <button class="btn-item"> '+ "Delete" +' </button> </td> </tr>'
      }
      tableBody.innerHTML = dataHtml;

      // Usuwanie elementów z tabeli ( przy każdym stworzeniu elementu 
      // dodawany jest przycisk pozwalający na usunięcie danego elementu)
      document.querySelectorAll(".btn-delete").forEach(item => {
        item.addEventListener('click', event => {
          document.getElementById(item.id).remove();
          const valuesToRemove = [item.id];
          table = table.filter(table => !valuesToRemove.includes(table));
        })
      });

    }
  });


  // Wysłanie zapytania do servera google, odebranie danych, stworzenie modelu, 
  // rozwiazanie problemu, prezentacja danych na mapie 
  document.getElementById("calculate-btn").addEventListener('click', function() {

      //Tworzenie puli zapytań dla googl'a
      if(table.length >= 2){
        var request = [];
        for(let i = 0; i < table.length - 1; i++){
          for(let j = 1; j < table.length - i; j++){
            
            request.push({
              origin      : table[i],
              destination : table[j + i],
              travelMode  : google.maps.DirectionsTravelMode.DRIVING
            });

          }
        }

      }else{
        alert("You have no power HERE !");
      }

      // Pobieranie zapytań z serwerów googl'a
      // Maksymala liczba zapytań to 10, jeśli będzie więcej zostaną one wysłane z opóźnieniem
      // dlatego dla większej liczby punktów trzeba czekać na wyniki 
      var distance_table = [];
      var delayrequest = request.length*30;
        for(let i = 0; i < request.length; i++){

          setTimeout( function(){ 
          directionsService.route(request[i], function(response, status) {
            if ( status == google.maps.DirectionsStatus.OK ) {
              distance_table.push(Number(response.routes[0].legs[0].distance.value/1000));
              
            }else{
              alert("Wrong item: " + table[i].toString() + " or " + table[j+i].toString()) ;
            }

          });
        }, delayrequest*i);
        }
      

      setTimeout( function(){ 

      var n = table.length;
      var odleglosci = new Array(n);
      for( let i =0; i < n; i++) { odleglosci[i] = new Array(n); }
      
      // Stworzenie tabeli odległość np.
      //  | M | 5 | 2 |
      //  | 5 | M | 7 |
      //  | 2 | 7 | M |
      // M = 999999999; bardzo duża liczba.
      var k = 0;
      for( let i = 0; i < n; i++){
        for( let j = i+1; j < n; j++){ 
          odleglosci[i][i] = 999999999;
          odleglosci[j][j] = 999999999;
          odleglosci[i][j] = distance_table[k];
          odleglosci[j][i] = distance_table[k];
          k++;
        }
      }

      // TWORZENIE MODELU
      // Przykładowy wygląd modelu  
      /* 
      Minimize 
      obj: +999999999 x1 +280.073 x2 +271.919 x3 
           +280.073 x4 +999999999 x5 +558.13 x6 
           +271.919 x7 +558.13 x8 +999999999 x9

      Subject To
      ogr1_0: +x1 +x2 +x3 = 1
      ogr1_1: +x4 +x5 +x6 = 1
      ogr1_2: +x7 +x8 +x9 = 1
      ogr2_0: +x1 +x4 +x7 = 1
      ogr2_1: +x2 +x5 +x8 = 1
      ogr2_2: +x3 +x6 +x9 = 1
      og3_1_1: +x2 +x4 <= 1
      og3_1_2: +x3 +x7 <= 1
      og3_2_2: +x6 +x8 <= 1

      Bounds
      x1 <= 1
      x2 <= 1
      x3 <= 1
      x4 <= 1
      x5 <= 1
      x6 <= 1
      x7 <= 1
      x8 <= 1
      x9 <= 1

      General
      x1 x2 x3 x4 x5 x6 x7 x8 x9 

      End
      */

      // Tworzenie Funkcji celu.
      var text_block_to_glp = "Minimize \nobj:";

      let num = 1;
      for( let i =0; i < n; i++){
        for( let j = 0; j < n; j++){
          text_block_to_glp += " +" + odleglosci[i][j] + " x" + num;
          num++;
        }
      }
      

      // Tworzenie Ograniczeń.
      text_block_to_glp += "\n\nSubject To"

      num = 1;
      for( let i =0; i < n; i++){
          temp = "";
          for( let j = 0; j < n; j++){
              temp += " +x" + num;
              num++;
          }
          text_block_to_glp += "\nogr1_"+i+":" + temp + " = 1"
      }

      num = 1;
      for( let i = 0; i < n; i++){
          temp = "";
          for( let j = 0; j < n; j++){
              temp += " +x" + num;
              num = num + n;
          }
          num = i + 2;
          text_block_to_glp += "\nogr2_"+i+":" + temp + " = 1"
      }

      if(n > 2){
        num = 1;
        for( let i = 1; i < n; i++){
            let k = 1;
            let temp = 0;
            for( let j = i; j < n; j++){
                num += 1;
                temp = num + (n-1)*k;
                text_block_to_glp += "\nog3_"+i+"_"+j+ ": +x" + num + " +x" + temp + " <= 1";
                k++;
            }
            num += 1+i;

        }
      }

      text_block_to_glp += "\n\nBounds"
      for(let i = 1; i < n*n+1; i++){
          text_block_to_glp += "\nx" + i + " <= 1";
      }

      // Tworzenie wszystkich zmiennych
      text_block_to_glp += "\n\nGeneral\n"
      for(let i = 1; i < n*n+1; i++){
          text_block_to_glp += "x" + i + " ";
      }

      text_block_to_glp += "\n\nEnd"

      // Wysłanie modelu do solvera
      var lp = glp_create_prob();
      glp_read_lp_from_string(lp, null, text_block_to_glp);
      
      glp_scale_prob(lp, GLP_SF_AUTO);

      var smcp = new SMCP({presolve: GLP_ON});
      glp_simplex(lp, smcp);

      var iocp = new IOCP({presolve: GLP_ON});
      glp_intopt(lp, iocp);

      // Wyświetlenie modelu w konsoli
      console.log(text_block_to_glp);

      // Wyświetlenie wyników w konsolu
      console.log("obj: " + glp_mip_obj_val(lp));
      for(var i = 1; i <= glp_get_num_cols(lp); i++){
        console.log(glp_get_col_name(lp, i)  + " = " + glp_mip_col_val(lp, i));
      }
      // Przykładowy wynik 
      /*
      obj: 1110.1219999999998 
      x1 = 0
      x2 = 1 
      x3 = 0 
      x4 = 0 
      x5 = 0 
      x6 = 1 
      x7 = 1 
      x8 = 0 
      x9 = 0
      */

      // Umieszczenie posortownaych punktów wedłgu 
      // optymalnej trasy.
      var wyn = [];
      wyn.push(table[0])
      let itr = 0;
      for(let i = 0; i < n; i++){
        for(let j = 1; j < n + 1; j++){
          if( glp_mip_col_val(lp, itr+j) == 1){
            wyn.push(table[j-1]);
            itr = j*n - n;
            j = n+1;
          }
        }
      }

      // Stworzenie tabeli miejsc dla których ma
      // zostać stworzona trasa.
      var loc = [];
      for(let i = 1; i < n; i++){
        loc.push({location: wyn[i]})
      }

      // Wyczyszczenie mapy ze starych punktów
      var directionsService = new google.maps.DirectionsService();
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 52, lng: 19 },
        zoom: 6,
        mapTypeId: "roadmap",
      });

      // Wyczyszczenie danych nawigacji 
      document.getElementById("right-panel").innerHTML = "";
      
      //Możliwość ręcznego przesuwania trasy oraz aktualizacja nawigacji
      const directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        map,
        panel: document.getElementById("right-panel"),
      });

      //Obliczenie całkowitego dystansu trasy 
      directionsRenderer.addListener("directions_changed", () => {
        computeTotalDistance(directionsRenderer.getDirections());
      });

      //Wysłanie zapytania do googl'a o stworzenie trasy 
      //Umieszczenie trasy na mapie
      //Stowrzenie nawigacji oraz jej wyśiwtelnie.
      displayRoute(
        wyn[0],
        wyn[0],
        loc,
        directionsService,
        directionsRenderer
      );


      function displayRoute(origin, destination, loc, service, display) {
        service.route(
          {
            origin: origin,
            destination: destination,
            waypoints: loc,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidTolls: true,
          },
          (result, status) => {
            if (status === "OK") {
              display.setDirections(result);
            } else {
              alert("Could not display directions due to: " + status);
            }
          }
        );
      }

      function computeTotalDistance(result) {
        let total = 0;
        const myroute = result.routes[0];

        for (let i = 0; i < myroute.legs.length; i++) {
          total += myroute.legs[i].distance.value;
        }
        total = total / 1000;
        document.getElementById("total").innerHTML = total + " km";
      }

      }, delayrequest*request.length + 500);
  });
  
  


}
