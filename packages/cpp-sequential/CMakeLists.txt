cmake_minimum_required(VERSION 3.0.0)
project(cpp-sequential VERSION 0.1.0)

set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)

include(CTest)
enable_testing()

include_directories(include)

add_library(sht 
    src/SHTSimple.cpp 
    src/SHTSimpleLookup.cpp
)

add_executable(sht-test-raw test/testRaw.cpp)
target_link_libraries(sht-test-raw sht)

add_executable(threshold benchmark/threshold.cpp)
target_link_libraries(threshold Threads::Threads)
target_link_libraries(threshold benchmark)
target_link_libraries(threshold sht)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
