# Analiza wydajności metod akceleracji obliczeń w środowiskach języka JavaScript na podstawie wybranych algorytmów przetwarzania obrazów.

## Środowiska
* Przeglądarka internetowa, różne silniki
  * V8
  * SpiderMonkey
  * Chakra
  * JavaScriptCore
  * Mobile/Desktop
* Node
* Deno

## Metody
* WASM
  * Ominięcie narzutu JS
  * Wsparcie dla SIMD na CPU (od Chrome 91)
* Moduły Cpp
  * https://nodejs.org/api/addons.html
* Wielowątkowość
  * Node
    * Fork
    * worker_threads
  * Deno
    * Web Worker API
  * Przeglądarka
    * Web Worker API
* GPU
  * vanilla WebGL
  * gpu.js
* Hybrydy w zależności od wyników i algorytmów (w zależności od czasu)

## Algorytmy
* Transformacja Hougha
* Floyd-Steinberg dithering
* ... w zależności od czasu więcej
* Wyszukiwanie wzorca w tekście - dla porównania jako algorytm trudny do masowego zrównoleglenia w tym modelu wykonania (WebGL).

## Zakres prac
* Analiza literatury
* Opracowanie metody pomiaru wydajności z automatycznym wysyłaniem wyników
  * Środowiska:
    * Przeglądarka - strona internetowa
    * Node - paczka npm'owa odpalana np: `npx js-acc-benchmark`
    * Deno - skrypt (do doprecyzowania)
* Implementacja algorytmów dla wskazanych metod
* Przeprowadzenie pomiarów w możliwie dużej skali (hostowana strona, paczka npm'owa)
* Opracowanie wyników

## Z czym nie miałem styczności (albo małą)
* WASM
* Deno
* Moduły Cpp w Node