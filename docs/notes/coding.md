* Webpack w trybie devtool: 'eval' wsadza wszystko w eval - jeśli budujemy sub-bibliotekę w trybie dev to zawiera ona również webpackowe helpery, które próbują się wykonać w złym kontekście 
  * https://github.com/webpack/webpack/issues/11277
  * https://stackoverflow.com/questions/69087668/bundle-webpack-react-library-as-an-esm-module-object-defineproperty-called-on/69200112#69200112
* Lerna przy lerna run build wykonuje skrypt we właściwej kolejności związanej z wzajemną zależnością pakietów
* test-simple
  * Pobieranie pixeli poprzez rysowanie na canvas jest niedokładne, ponieważ obraz jest wygładzany, opcja `context.imageSmoothingEnabled` temu zapobiega
* Memory requirement of the accumulator array is reduced to 59% when the image center, instead of corner, is used as the origin.
* Math.max i Math.min crashują przy dużych tablicach - przepełnienie stosu, wartości są argumentami funkcji
* Rozdział na tyle pakietów, żeby mieć swobodę w konfiguracji i budowaniu kodu - np Workery
* Trzeba pamiętać o isolated-origin - domena + headery
* Pokazać na wykresach t(n) steadyState dla pierwszego wykonania + pierwszych paru
  * dodatkowo CoV dla paru moving okien
* flaga --jitless zapewnia mniejszy CoV kosztem czasu wykonania
* Różnica pomiędzy P-Core a E-Core 0.15 vs 0.25
* jest transpiluje w locie i jest wolniej 
* prezentacja trybów benchmarkowania jako macierzy t.i/extracted.non
* WAŻNE:
  * Brak możliwości ekstrakcji funkcji z innego modułu - w procesie budowanie jest umieszczana globalnie, a to oznacza, że jest optymalizowana
  * udowodnić/wspomnieć, czy budowanie TS->JS + lib nie wpływa na strukturę wydajności
* w cpp stosuję te same konwencje (nazwy itd) co w JS
* wasm kompilator 
  * wyrównuje strukturę do 8b = double
  * ALLOW_MEMORY_GROWTH=1 wymagany dla nieograniczonych danych
* emscripten stosuje embind do bindowania JS <-> CPP, alternatywą jest operowanie na stercie bezpośrednio i alokacja pamięci z użyciem malloc exportowanego z Cpp
* symlinki stworzone przez lernę pozwalają unikać relatywnych ścieżek w górę 
* simd lepiej f16 - i tak nie zabraknie precyzji - zaokrąglany do całości
* tylko jedna konfiguracja wasm działająca jako ESM
  * single file
  * environment=web
  * export_es6
* simd wrapper może dokładać narzut zależny liniowo od rozmiaru akumulatora - konsekwencja jednolitego interfejsu we wszystkich 
* trzeba przeanalizować optymalizacje kodu dla cold start w devtoolsach - performance
* llvm vectorize passes przy analizie vektoryzacji przy implicit SIMD
* Workers:
  * przyczyny wolniejszego działania
    * nierównomierne rozłożenie sinusoidy
    * dla równego rozłożenia sin lepiej całe rho niż theta
*  dziki rounding przyspiesza https://gist.github.com/Olical/1162452
* przez obiekt 20x wolniej https://stackoverflow.com/questions/37982072/web-worker-20x-worse-performance``

* czy w WASM różnica z dzikim zaokrąglaniem da inny wynik - porównać WAT?
* gupi webpack nie transpilije workerów poprawnie jeśli inicjujemy je np:
  ```ts
  import worker_threads from "worker_threads";
  new worker_threads.Worker(...)
  // zamiast
  import {Worker} from "worker_threads";
  new Worker(...)
  ```
* ForkTsCheckerWebpackPlugin opcja typescript.mode = write-dts razem z transpileOnly true w ts-loader



* przyspiszenie obliczeń przez specyfikację problemu, np obliczenie tylko dla określonych kątów nachyleń


* gpu
  * ważne odpowiedni kod transpilowany do shaderów (kernela) kod równoważny w TS daje różne wyniki
  * wymaganiem stały interface we wszystkich metodach akceleracji - dlatego trzeba przekształcić Float32 to uint32
  * bardzo ważny jest podział dla odpowiednich kątów na y(rho,theta,x) i x(rho,theta,y)
  * Delikatne (+/- 1 linia) różnice w wykrywaniu, związek z mniejsza precyzją i sumowaniem błędów

* przy różnych poziomach próbkowania wychodzi problem różnych zaokrągleń
  * wasm_f32x4_nearest robi half to even
  * std::round robi half up

* benchmarki od theta, mają złożoność liniową, benchmark od rho nie ma praktycznego zastosowania, ponieważ rho jako przekątna jest optymalnym rozwiązaniem, a wahania odległości mają mniejszy wpływ na jakość wykrywania niż próbkowanie kąta

* wycieki pamięci w wasm

* optymalizacja webpackowa psuje kompilację shadera
  ```
  t<this.constants.width*this.constants.height&&1==e[t]&&a++
  ```
  inkrementacja a pod warunkiem <warunek>&&a++

* optymalizacja, minifikacja może popsuć kod, który gpu.js może przetranspilować na kernel 
  ```
  terserOptions: {
          compress: {
            conditionals: false,
          },
        },
  ```

* gpu istotne żeby pamiętać o max wymiarach tekstur 
* float32 vs float64 ma znaczenie dla różnich akumulatora


# circles CHT

* pojedyncze pixele, kiedy spleciemy je z sobelem znikają (logiczne w sumie, gradient 0, bo nie mają otoczenia)
* zbadać wpływ fast-math na wydajność https://clang.llvm.org/docs/UsersManual.html#cmdoption-ffast-math
* splot warty pokazania .wat - ładowanie kernela przez const bezpośrednio, optymalizacja inline
* sprawdzić, czy kompilator sam unfolduje loopa w conv2 (chyba nie)

* Dobre rozważania i problemy budowania https://vitejs.dev/guide/why.html


## gpu.js
* argument z kernelem nie działa w gpu.js - ewentualne pole do zbadania
* pokazać kod shadera .kernel
* optymalizacja bounds nic nie daje, architektura SIMT - dwa fory gpx gpy

* napisać o unjs, unified javascript
