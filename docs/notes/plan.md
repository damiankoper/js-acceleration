1. Wstęp
   * Analiza obrazów cyfrowych, potrzeby, zastosowania, ograniczenia
     * Rola sieci neuronowych (krótko)
       * Krótka klasyfikacja
       * Uczenie głębokie i sieci konwolucyjne (splot/filtr)
     * Rola pozostałych algorytmów (krótko)
       * Wykrywanie cech/kształtów
       * Wykrywanie ruchu
       * ...
     * Analiza jako intensywny obliczeniowo, często dający się zrównoleglić problem obliczeniowy
     * Duża i rosnąca rola środowisk webowych
   * Cel badań i zawartość pracy
2. Transformacja Hough'a
   * Opis
     * Specyficzny przypadek transformacji Radona
     * Hough - slope + intercept
     * Duda, Hart - angle + radius
   * Warianty
     * SHT - Standard Hough transform (analitycznie opisane kształty)
       * PTLM - Point to line mapping
     * GHT - General Hough Transform (dowolne kształty) <- ogarnąć
     * CHT - Circle Hough Transform
     * PHT - Probabilistic Hough Transform
     * RHT - Random Hough Transform
   * Ograniczenia
   * Zastosowania
3. Technologie i środowiska webowe:
   * JavaScript
   * Środowiska
     * Silniki JS
       * V8
         * Architektura V8
       * SpiderMonkey
       * Chakra
       * JavaScriptCore
     * Przeglądarka
       * Chrome (Chromium)
       * IE
       * Edge
       * Firefox
       * Safari
     * Node (V8)
     * Dino (V8)
4. Metody akceleracji
   * TypedArray - optymalizacja silnika
   * WASM
     * asm.js
     * C++ to WASM
     * WASM + SIMD
   * Wielowątkowość
     * Rozwiązanie natywne
   * Modułu C++
     * Bindowane podprogramy C++
   * GPU
     * WebGL
     * Pipeline WebGL
     * Jak wykorzystać do obliczeń GPGPU
     * Brak współdzielonych zmiennych rodzi problemy przy specyficznych zadaniach
   * Możliwych hybrydy
5. Metodologia pomiarów wydajności (@TODO: luźno, ulogicznić kolejność)
    * --enable-benchmarking w Chrome
    * processObject.hrtime w Node i Deno
    * Dlaczego nie wyłączam JIT, o specyfice algorytmu i różnicy numerical vs real-life performance
      * Stead-state - odrzucenie pomiarów, których współczynnik zmienności jest większa niż threshold a priori
    * Porównanie wydajności
      * Speedup
    ![image](https://user-images.githubusercontent.com/28621467/132757249-4b59fe1a-827b-4d22-aed8-8b44b5108d78.png)
      * Porównanie do natywnego C++
        * "Dlaczego nie wyłączam JIT..." - w C++ kompilacja też z O3
      * Porównanie do natywnego JavaScript 
      * Średnia geometryczna
    * Przy GPU ważny flow danych z/do GPU (readPixels API)
    * Zużycie pamięci @TODO
      * Mniej ważne
    * Skala testów
6. Wymagania i opis środowiska pomiarowego
   * Wspólny format danych
   * Przeglądarka
   * Serwer
7. Opis zaimplementowanych algorytmów
   * {SHT,GHT,CHT}
     * Przeglądarka
       * Bez optymalizacji (+ małe modyfikacje z TypedArray)
       * WASM
         * SIMD
       * Workers
       * GPU
     * Serwer
       * Bez optymalizacji
       * threads
       * C++ modules
   * ... w zależności od czasu i objętości
8. Wyniki pomiarów lokalnych
   * Wnioski
9. Wyniki pomiarów masowych
   * Wnioski
10. Podsumowanie
   * Wnioski z pomiarów
   * Możliwości dalszych badań i rozwoju