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
* symlinki stworzone przez lernę pozwalają unikać relatywnych ścieżek w górę 
* simd lepiej f16 - i tak nie zabraknie precyzji - zaokrąglany do całości
* tylko jedna konfiguracja wasm działająca jako ESM
  * single file
  * environment=web
  * export_es6
* simd wrapper może dokładać narzut zależny liniowo od rozmiaru akumulatora - konsekwencja jednolitego interfejsu we wszystkich 
* trzeba przeanalizować optymalizacje kodu dla cold start w devtoolsach - performance
* *llvm vectorize passes przy analizie vektoryzacji przy implicit SIMD
