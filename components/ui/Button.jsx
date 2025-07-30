"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

const colorVariants = {
  sky: {
    100: {
      200: "bg-sky-100 dark:bg-sky-200 hover:bg-transparent p-2 px-4 hover:text-sky-100 dark:hover:text-sky-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-sky-100 dark:border-sky-200 cursor-pointer",
    },
    200: {
      300: "bg-sky-200 dark:bg-sky-300 hover:bg-transparent p-2 px-4 hover:text-sky-200 dark:hover:text-sky-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-sky-200 dark:border-sky-300 cursor-pointer",
    },
    300: {
      400: "bg-sky-300 dark:bg-sky-400 hover:bg-transparent p-2 px-4 hover:text-sky-300 dark:hover:text-sky-400 smooth rounded-lg text-white border-2 border-sky-300 dark:border-sky-400 cursor-pointer",
    },
    400: {
      500: "bg-sky-400 dark:bg-sky-500 hover:bg-transparent p-2 px-4 hover:text-sky-400 dark:hover:text-sky-500 smooth rounded-lg text-white border-2 border-sky-400 dark:border-sky-500 cursor-pointer",
    },
    500: {
      600: "bg-sky-500 dark:bg-sky-600 hover:bg-transparent p-2 px-4 hover:text-sky-500 dark:hover:text-sky-600 smooth rounded-lg text-white border-2 border-sky-500 dark:border-sky-600 cursor-pointer",
    },
    600: {
      700: "bg-sky-600 dark:bg-sky-700 hover:bg-transparent p-2 px-4 hover:text-sky-600 dark:hover:text-sky-700 smooth rounded-lg text-white border-2 border-sky-600 dark:border-sky-700 cursor-pointer",
    },
    700: {
      800: "bg-sky-700 dark:bg-sky-800 hover:bg-transparent p-2 px-4 hover:text-sky-700 dark:hover:text-sky-800 smooth rounded-lg text-white border-2 border-sky-700 dark:border-sky-800 cursor-pointer",
    },
    800: {
      900: "bg-sky-800 dark:bg-sky-900 hover:bg-transparent p-2 px-4 hover:text-sky-800 dark:hover:text-sky-900 smooth rounded-lg text-white border-2 border-sky-800 dark:border-sky-900 cursor-pointer",
    },
  },
  blue: {
    100: {
      200: "bg-blue-100 dark:bg-blue-200 hover:bg-transparent p-2 px-4 hover:text-blue-100 dark:hover:text-blue-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-blue-100 dark:border-blue-200 cursor-pointer",
    },
    200: {
      300: "bg-blue-200 dark:bg-blue-300 hover:bg-transparent p-2 px-4 hover:text-blue-200 dark:hover:text-blue-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-blue-200 dark:border-blue-300 cursor-pointer",
    },
    300: {
      400: "bg-blue-300 dark:bg-blue-400 hover:bg-transparent p-2 px-4 hover:text-blue-300 dark:hover:text-blue-400 smooth rounded-lg text-white border-2 border-blue-300 dark:border-blue-400 cursor-pointer",
    },
    400: {
      500: "bg-blue-400 dark:bg-blue-500 hover:bg-transparent p-2 px-4 hover:text-blue-400 dark:hover:text-blue-500 smooth rounded-lg text-white border-2 border-blue-400 dark:border-blue-500 cursor-pointer",
    },
    500: {
      600: "bg-blue-500 dark:bg-blue-600 hover:bg-transparent p-2 px-4 hover:text-blue-500 dark:hover:text-blue-600 smooth rounded-lg text-white border-2 border-blue-500 dark:border-blue-600 cursor-pointer",
    },
    600: {
      700: "bg-blue-600 dark:bg-blue-700 hover:bg-transparent p-2 px-4 hover:text-blue-600 dark:hover:text-blue-700 smooth rounded-lg text-white border-2 border-blue-600 dark:border-blue-700 cursor-pointer",
    },
    700: {
      800: "bg-blue-700 dark:bg-blue-800 hover:bg-transparent p-2 px-4 hover:text-blue-700 dark:hover:text-blue-800 smooth rounded-lg text-white border-2 border-blue-700 dark:border-blue-800 cursor-pointer",
    },
    800: {
      900: "bg-blue-800 dark:bg-blue-900 hover:bg-transparent p-2 px-4 hover:text-blue-800 dark:hover:text-blue-900 smooth rounded-lg text-white border-2 border-blue-800 dark:border-blue-900 cursor-pointer",
    },
  },
  red: {
    100: {
      200: "bg-red-100 dark:bg-red-200 hover:bg-transparent p-2 px-4 hover:text-red-100 dark:hover:text-red-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-red-100 dark:border-red-200 cursor-pointer",
    },
    200: {
      300: "bg-red-200 dark:bg-red-300 hover:bg-transparent p-2 px-4 hover:text-red-200 dark:hover:text-red-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-red-200 dark:border-red-300 cursor-pointer",
    },
    300: {
      400: "bg-red-300 dark:bg-red-400 hover:bg-transparent p-2 px-4 hover:text-red-300 dark:hover:text-red-400 smooth rounded-lg text-white border-2 border-red-300 dark:border-red-400 cursor-pointer",
    },
    400: {
      500: "bg-red-400 dark:bg-red-500 hover:bg-transparent p-2 px-4 hover:text-red-400 dark:hover:text-red-500 smooth rounded-lg text-white border-2 border-red-400 dark:border-red-500 cursor-pointer",
    },
    500: {
      600: "bg-red-500 dark:bg-red-600 hover:bg-transparent p-2 px-4 hover:text-red-500 dark:hover:text-red-600 smooth rounded-lg text-white border-2 border-red-500 dark:border-red-600 cursor-pointer",
    },
    600: {
      700: "bg-red-600 dark:bg-red-700 hover:bg-transparent p-2 px-4 hover:text-red-600 dark:hover:text-red-700 smooth rounded-lg text-white border-2 border-red-600 dark:border-red-700 cursor-pointer",
    },
    700: {
      800: "bg-red-700 dark:bg-red-800 hover:bg-transparent p-2 px-4 hover:text-red-700 dark:hover:text-red-800 smooth rounded-lg text-white border-2 border-red-700 dark:border-red-800 cursor-pointer",
    },
    800: {
      900: "bg-red-800 dark:bg-red-900 hover:bg-transparent p-2 px-4 hover:text-red-800 dark:hover:text-red-900 smooth rounded-lg text-white border-2 border-red-800 dark:border-red-900 cursor-pointer",
    },
  },
  green: {
    100: {
      200: "bg-green-100 dark:bg-green-200 hover:bg-transparent p-2 px-4 hover:text-green-100 dark:hover:text-green-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-green-100 dark:border-green-200 cursor-pointer",
    },
    200: {
      300: "bg-green-200 dark:bg-green-300 hover:bg-transparent p-2 px-4 hover:text-green-200 dark:hover:text-green-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-green-200 dark:border-green-300 cursor-pointer",
    },
    300: {
      400: "bg-green-300 dark:bg-green-400 hover:bg-transparent p-2 px-4 hover:text-green-300 dark:hover:text-green-400 smooth rounded-lg text-white border-2 border-green-300 dark:border-green-400 cursor-pointer",
    },
    400: {
      500: "bg-green-400 dark:bg-green-500 hover:bg-transparent p-2 px-4 hover:text-green-400 dark:hover:text-green-500 smooth rounded-lg text-white border-2 border-green-400 dark:border-green-500 cursor-pointer",
    },
    500: {
      600: "bg-green-500 dark:bg-green-600 hover:bg-transparent p-2 px-4 hover:text-green-500 dark:hover:text-green-600 smooth rounded-lg text-white border-2 border-green-500 dark:border-green-600 cursor-pointer",
    },
    600: {
      700: "bg-green-600 dark:bg-green-700 hover:bg-transparent p-2 px-4 hover:text-green-600 dark:hover:text-green-700 smooth rounded-lg text-white border-2 border-green-600 dark:border-green-700 cursor-pointer",
    },
    700: {
      800: "bg-green-700 dark:bg-green-800 hover:bg-transparent p-2 px-4 hover:text-green-700 dark:hover:text-green-800 smooth rounded-lg text-white border-2 border-green-700 dark:border-green-800 cursor-pointer",
    },
    800: {
      900: "bg-green-800 dark:bg-green-900 hover:bg-transparent p-2 px-4 hover:text-green-800 dark:hover:text-green-900 smooth rounded-lg text-white border-2 border-green-800 dark:border-green-900 cursor-pointer",
    },
  },
  purple: {
    100: {
      200: "bg-purple-100 dark:bg-purple-200 hover:bg-transparent p-2 px-4 hover:text-purple-100 dark:hover:text-purple-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-purple-100 dark:border-purple-200 cursor-pointer",
    },
    200: {
      300: "bg-purple-200 dark:bg-purple-300 hover:bg-transparent p-2 px-4 hover:text-purple-200 dark:hover:text-purple-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-purple-200 dark:border-purple-300 cursor-pointer",
    },
    300: {
      400: "bg-purple-300 dark:bg-purple-400 hover:bg-transparent p-2 px-4 hover:text-purple-300 dark:hover:text-purple-400 smooth rounded-lg text-white border-2 border-purple-300 dark:border-purple-400 cursor-pointer",
    },
    400: {
      500: "bg-purple-400 dark:bg-purple-500 hover:bg-transparent p-2 px-4 hover:text-purple-400 dark:hover:text-purple-500 smooth rounded-lg text-white border-2 border-purple-400 dark:border-purple-500 cursor-pointer",
    },
    500: {
      600: "bg-purple-500 dark:bg-purple-600 hover:bg-transparent p-2 px-4 hover:text-purple-500 dark:hover:text-purple-600 smooth rounded-lg text-white border-2 border-purple-500 dark:border-purple-600 cursor-pointer",
    },
    600: {
      700: "bg-purple-600 dark:bg-purple-700 hover:bg-transparent p-2 px-4 hover:text-purple-600 dark:hover:text-purple-700 smooth rounded-lg text-white border-2 border-purple-600 dark:border-purple-700 cursor-pointer",
    },
    700: {
      800: "bg-purple-700 dark:bg-purple-800 hover:bg-transparent p-2 px-4 hover:text-purple-700 dark:hover:text-purple-800 smooth rounded-lg text-white border-2 border-purple-700 dark:border-purple-800 cursor-pointer",
    },
    800: {
      900: "bg-purple-800 dark:bg-purple-900 hover:bg-transparent p-2 px-4 hover:text-purple-800 dark:hover:text-purple-900 smooth rounded-lg text-white border-2 border-purple-800 dark:border-purple-900 cursor-pointer",
    },
  },
  rose: {
    100: {
      200: "bg-rose-100 dark:bg-rose-200 hover:bg-transparent p-2 px-4 hover:text-rose-100 dark:hover:text-rose-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-rose-100 dark:border-rose-200 cursor-pointer",
    },
    200: {
      300: "bg-rose-200 dark:bg-rose-300 hover:bg-transparent p-2 px-4 hover:text-rose-200 dark:hover:text-rose-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-rose-200 dark:border-rose-300 cursor-pointer",
    },
    300: {
      400: "bg-rose-300 dark:bg-rose-400 hover:bg-transparent p-2 px-4 hover:text-rose-300 dark:hover:text-rose-400 smooth rounded-lg text-white border-2 border-rose-300 dark:border-rose-400 cursor-pointer",
    },
    400: {
      500: "bg-rose-400 dark:bg-rose-500 hover:bg-transparent p-2 px-4 hover:text-rose-400 dark:hover:text-rose-500 smooth rounded-lg text-white border-2 border-rose-400 dark:border-rose-500 cursor-pointer",
    },
    500: {
      600: "bg-rose-500 dark:bg-rose-600 hover:bg-transparent p-2 px-4 hover:text-rose-500 dark:hover:text-rose-600 smooth rounded-lg text-white border-2 border-rose-500 dark:border-rose-600 cursor-pointer",
    },
    600: {
      700: "bg-rose-600 dark:bg-rose-700 hover:bg-transparent p-2 px-4 hover:text-rose-600 dark:hover:text-rose-700 smooth rounded-lg text-white border-2 border-rose-600 dark:border-rose-700 cursor-pointer",
    },
    700: {
      800: "bg-rose-700 dark:bg-rose-800 hover:bg-transparent p-2 px-4 hover:text-rose-700 dark:hover:text-rose-800 smooth rounded-lg text-white border-2 border-rose-700 dark:border-rose-800 cursor-pointer",
    },
    800: {
      900: "bg-rose-800 dark:bg-rose-900 hover:bg-transparent p-2 px-4 hover:text-rose-800 dark:hover:text-rose-900 smooth rounded-lg text-white border-2 border-rose-800 dark:border-rose-900 cursor-pointer",
    },
  },
  emerald: {
    100: {
      200: "bg-emerald-100 dark:bg-emerald-200 hover:bg-transparent p-2 px-4 hover:text-emerald-100 dark:hover:text-emerald-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-emerald-100 dark:border-emerald-200 cursor-pointer",
    },
    200: {
      300: "bg-emerald-200 dark:bg-emerald-300 hover:bg-transparent p-2 px-4 hover:text-emerald-200 dark:hover:text-emerald-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-emerald-200 dark:border-emerald-300 cursor-pointer",
    },
    300: {
      400: "bg-emerald-300 dark:bg-emerald-400 hover:bg-transparent p-2 px-4 hover:text-emerald-300 dark:hover:text-emerald-400 smooth rounded-lg text-white border-2 border-emerald-300 dark:border-emerald-400 cursor-pointer",
    },
    400: {
      500: "bg-emerald-400 dark:bg-emerald-500 hover:bg-transparent p-2 px-4 hover:text-emerald-400 dark:hover:text-emerald-500 smooth rounded-lg text-white border-2 border-emerald-400 dark:border-emerald-500 cursor-pointer",
    },
    500: {
      600: "bg-emerald-500 dark:bg-emerald-600 hover:bg-transparent p-2 px-4 hover:text-emerald-500 dark:hover:text-emerald-600 smooth rounded-lg text-white border-2 border-emerald-500 dark:border-emerald-600 cursor-pointer",
    },
    600: {
      700: "bg-emerald-600 dark:bg-emerald-700 hover:bg-transparent p-2 px-4 hover:text-emerald-600 dark:hover:text-emerald-700 smooth rounded-lg text-white border-2 border-emerald-600 dark:border-emerald-700 cursor-pointer",
    },
    700: {
      800: "bg-emerald-700 dark:bg-emerald-800 hover:bg-transparent p-2 px-4 hover:text-emerald-700 dark:hover:text-emerald-800 smooth rounded-lg text-white border-2 border-emerald-700 dark:border-emerald-800 cursor-pointer",
    },
    800: {
      900: "bg-emerald-800 dark:bg-emerald-900 hover:bg-transparent p-2 px-4 hover:text-emerald-800 dark:hover:text-emerald-900 smooth rounded-lg text-white border-2 border-emerald-800 dark:border-emerald-900 cursor-pointer",
    },
  },
  yellow: {
    100: {
      200: "bg-yellow-100 dark:bg-yellow-200 hover:bg-transparent p-2 px-4 hover:text-yellow-100 dark:hover:text-yellow-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-yellow-100 dark:border-yellow-200 cursor-pointer",
    },
    200: {
      300: "bg-yellow-200 dark:bg-yellow-300 hover:bg-transparent p-2 px-4 hover:text-yellow-200 dark:hover:text-yellow-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-yellow-200 dark:border-yellow-300 cursor-pointer",
    },
    300: {
      400: "bg-yellow-300 dark:bg-yellow-400 hover:bg-transparent p-2 px-4 hover:text-yellow-300 dark:hover:text-yellow-400 smooth rounded-lg text-gray-800 dark:text-white border-2 border-yellow-300 dark:border-yellow-400 cursor-pointer",
    },
    400: {
      500: "bg-yellow-400 dark:bg-yellow-500 hover:bg-transparent p-2 px-4 hover:text-yellow-400 dark:hover:text-yellow-500 smooth rounded-lg text-gray-800 dark:text-white border-2 border-yellow-400 dark:border-yellow-500 cursor-pointer",
    },
    500: {
      600: "bg-yellow-500 dark:bg-yellow-600 hover:bg-transparent p-2 px-4 hover:text-yellow-500 dark:hover:text-yellow-600 smooth rounded-lg text-white border-2 border-yellow-500 dark:border-yellow-600 cursor-pointer",
    },
    600: {
      700: "bg-yellow-600 dark:bg-yellow-700 hover:bg-transparent p-2 px-4 hover:text-yellow-600 dark:hover:text-yellow-700 smooth rounded-lg text-white border-2 border-yellow-600 dark:border-yellow-700 cursor-pointer",
    },
    700: {
      800: "bg-yellow-700 dark:bg-yellow-800 hover:bg-transparent p-2 px-4 hover:text-yellow-700 dark:hover:text-yellow-800 smooth rounded-lg text-white border-2 border-yellow-700 dark:border-yellow-800 cursor-pointer",
    },
    800: {
      900: "bg-yellow-800 dark:bg-yellow-900 hover:bg-transparent p-2 px-4 hover:text-yellow-800 dark:hover:text-yellow-900 smooth rounded-lg text-white border-2 border-yellow-800 dark:border-yellow-900 cursor-pointer",
    },
  },
  cyan: {
    100: {
      200: "bg-cyan-100 dark:bg-cyan-200 hover:bg-transparent p-2 px-4 hover:text-cyan-100 dark:hover:text-cyan-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-cyan-100 dark:border-cyan-200 cursor-pointer",
    },
    200: {
      300: "bg-cyan-200 dark:bg-cyan-300 hover:bg-transparent p-2 px-4 hover:text-cyan-200 dark:hover:text-cyan-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-cyan-200 dark:border-cyan-300 cursor-pointer",
    },
    300: {
      400: "bg-cyan-300 dark:bg-cyan-400 hover:bg-transparent p-2 px-4 hover:text-cyan-300 dark:hover:text-cyan-400 smooth rounded-lg text-white border-2 border-cyan-300 dark:border-cyan-400 cursor-pointer",
    },
    400: {
      500: "bg-cyan-400 dark:bg-cyan-500 hover:bg-transparent p-2 px-4 hover:text-cyan-400 dark:hover:text-cyan-500 smooth rounded-lg text-white border-2 border-cyan-400 dark:border-cyan-500 cursor-pointer",
    },
    500: {
      600: "bg-cyan-500 dark:bg-cyan-600 hover:bg-transparent p-2 px-4 hover:text-cyan-500 dark:hover:text-cyan-600 smooth rounded-lg text-white border-2 border-cyan-500 dark:border-cyan-600 cursor-pointer",
    },
    600: {
      700: "bg-cyan-600 dark:bg-cyan-700 hover:bg-transparent p-2 px-4 hover:text-cyan-600 dark:hover:text-cyan-700 smooth rounded-lg text-white border-2 border-cyan-600 dark:border-cyan-700 cursor-pointer",
    },
    700: {
      800: "bg-cyan-700 dark:bg-cyan-800 hover:bg-transparent p-2 px-4 hover:text-cyan-700 dark:hover:text-cyan-800 smooth rounded-lg text-white border-2 border-cyan-700 dark:border-cyan-800 cursor-pointer",
    },
    800: {
      900: "bg-cyan-800 dark:bg-cyan-900 hover:bg-transparent p-2 px-4 hover:text-cyan-800 dark:hover:text-cyan-900 smooth rounded-lg text-white border-2 border-cyan-800 dark:border-cyan-900 cursor-pointer",
    },
  },
  orange: {
    100: {
      200: "bg-orange-100 dark:bg-orange-200 hover:bg-transparent p-2 px-4 hover:text-orange-100 dark:hover:text-orange-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-orange-100 dark:border-orange-200 cursor-pointer",
    },
    200: {
      300: "bg-orange-200 dark:bg-orange-300 hover:bg-transparent p-2 px-4 hover:text-orange-200 dark:hover:text-orange-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-orange-200 dark:border-orange-300 cursor-pointer",
    },
    300: {
      400: "bg-orange-300 dark:bg-orange-400 hover:bg-transparent p-2 px-4 hover:text-orange-300 dark:hover:text-orange-400 smooth rounded-lg text-white border-2 border-orange-300 dark:border-orange-400 cursor-pointer",
    },
    400: {
      500: "bg-orange-400 dark:bg-orange-500 hover:bg-transparent p-2 px-4 hover:text-orange-400 dark:hover:text-orange-500 smooth rounded-lg text-white border-2 border-orange-400 dark:border-orange-500 cursor-pointer",
    },
    500: {
      600: "bg-orange-500 dark:bg-orange-600 hover:bg-transparent p-2 px-4 hover:text-orange-500 dark:hover:text-orange-600 smooth rounded-lg text-white border-2 border-orange-500 dark:border-orange-600 cursor-pointer",
    },
    600: {
      700: "bg-orange-600 dark:bg-orange-700 hover:bg-transparent p-2 px-4 hover:text-orange-600 dark:hover:text-orange-700 smooth rounded-lg text-white border-2 border-orange-600 dark:border-orange-700 cursor-pointer",
    },
    700: {
      800: "bg-orange-700 dark:bg-orange-800 hover:bg-transparent p-2 px-4 hover:text-orange-700 dark:hover:text-orange-800 smooth rounded-lg text-white border-2 border-orange-700 dark:border-orange-800 cursor-pointer",
    },
    800: {
      900: "bg-orange-800 dark:bg-orange-900 hover:bg-transparent p-2 px-4 hover:text-orange-800 dark:hover:text-orange-900 smooth rounded-lg text-white border-2 border-orange-800 dark:border-orange-900 cursor-pointer",
    },
  },
  lime: {
    100: {
      200: "bg-lime-100 dark:bg-lime-200 hover:bg-transparent p-2 px-4 hover:text-lime-100 dark:hover:text-lime-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-lime-100 dark:border-lime-200 cursor-pointer",
    },
    200: {
      300: "bg-lime-200 dark:bg-lime-300 hover:bg-transparent p-2 px-4 hover:text-lime-200 dark:hover:text-lime-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-lime-200 dark:border-lime-300 cursor-pointer",
    },
    300: {
      400: "bg-lime-300 dark:bg-lime-400 hover:bg-transparent p-2 px-4 hover:text-lime-300 dark:hover:text-lime-400 smooth rounded-lg text-gray-800 dark:text-white border-2 border-lime-300 dark:border-lime-400 cursor-pointer",
    },
    400: {
      500: "bg-lime-400 dark:bg-lime-500 hover:bg-transparent p-2 px-4 hover:text-lime-400 dark:hover:text-lime-500 smooth rounded-lg text-gray-800 dark:text-white border-2 border-lime-400 dark:border-lime-500 cursor-pointer",
    },
    500: {
      600: "bg-lime-500 dark:bg-lime-600 hover:bg-transparent p-2 px-4 hover:text-lime-500 dark:hover:text-lime-600 smooth rounded-lg text-white border-2 border-lime-500 dark:border-lime-600 cursor-pointer",
    },
    600: {
      700: "bg-lime-600 dark:bg-lime-700 hover:bg-transparent p-2 px-4 hover:text-lime-600 dark:hover:text-lime-700 smooth rounded-lg text-white border-2 border-lime-600 dark:border-lime-700 cursor-pointer",
    },
    700: {
      800: "bg-lime-700 dark:bg-lime-800 hover:bg-transparent p-2 px-4 hover:text-lime-700 dark:hover:text-lime-800 smooth rounded-lg text-white border-2 border-lime-700 dark:border-lime-800 cursor-pointer",
    },
    800: {
      900: "bg-lime-800 dark:bg-lime-900 hover:bg-transparent p-2 px-4 hover:text-lime-800 dark:hover:text-lime-900 smooth rounded-lg text-white border-2 border-lime-800 dark:border-lime-900 cursor-pointer",
    },
  },
  indigo: {
    100: {
      200: "bg-indigo-100 dark:bg-indigo-200 hover:bg-transparent p-2 px-4 hover:text-indigo-100 dark:hover:text-indigo-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-indigo-100 dark:border-indigo-200 cursor-pointer",
    },
    200: {
      300: "bg-indigo-200 dark:bg-indigo-300 hover:bg-transparent p-2 px-4 hover:text-indigo-200 dark:hover:text-indigo-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-indigo-200 dark:border-indigo-300 cursor-pointer",
    },
    300: {
      400: "bg-indigo-300 dark:bg-indigo-400 hover:bg-transparent p-2 px-4 hover:text-indigo-300 dark:hover:text-indigo-400 smooth rounded-lg text-white border-2 border-indigo-300 dark:border-indigo-400 cursor-pointer",
    },
    400: {
      500: "bg-indigo-400 dark:bg-indigo-500 hover:bg-transparent p-2 px-4 hover:text-indigo-400 dark:hover:text-indigo-500 smooth rounded-lg text-white border-2 border-indigo-400 dark:border-indigo-500 cursor-pointer",
    },
    500: {
      600: "bg-indigo-500 dark:bg-indigo-600 hover:bg-transparent p-2 px-4 hover:text-indigo-500 dark:hover:text-indigo-600 smooth rounded-lg text-white border-2 border-indigo-500 dark:border-indigo-600 cursor-pointer",
    },
    600: {
      700: "bg-indigo-600 dark:bg-indigo-700 hover:bg-transparent p-2 px-4 hover:text-indigo-600 dark:hover:text-indigo-700 smooth rounded-lg text-white border-2 border-indigo-600 dark:border-indigo-700 cursor-pointer",
    },
    700: {
      800: "bg-indigo-700 dark:bg-indigo-800 hover:bg-transparent p-2 px-4 hover:text-indigo-700 dark:hover:text-indigo-800 smooth rounded-lg text-white border-2 border-indigo-700 dark:border-indigo-800 cursor-pointer",
    },
    800: {
      900: "bg-indigo-800 dark:bg-indigo-900 hover:bg-transparent p-2 px-4 hover:text-indigo-800 dark:hover:text-indigo-900 smooth rounded-lg text-white border-2 border-indigo-800 dark:border-indigo-900 cursor-pointer",
    },
  },
  teal: {
    100: {
      200: "bg-teal-100 dark:bg-teal-200 hover:bg-transparent p-2 px-4 hover:text-teal-100 dark:hover:text-teal-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-teal-100 dark:border-teal-200 cursor-pointer",
    },
    200: {
      300: "bg-teal-200 dark:bg-teal-300 hover:bg-transparent p-2 px-4 hover:text-teal-200 dark:hover:text-teal-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-teal-200 dark:border-teal-300 cursor-pointer",
    },
    300: {
      400: "bg-teal-300 dark:bg-teal-400 hover:bg-transparent p-2 px-4 hover:text-teal-300 dark:hover:text-teal-400 smooth rounded-lg text-white border-2 border-teal-300 dark:border-teal-400 cursor-pointer",
    },
    400: {
      500: "bg-teal-400 dark:bg-teal-500 hover:bg-transparent p-2 px-4 hover:text-teal-400 dark:hover:text-teal-500 smooth rounded-lg text-white border-2 border-teal-400 dark:border-teal-500 cursor-pointer",
    },
    500: {
      600: "bg-teal-500 dark:bg-teal-600 hover:bg-transparent p-2 px-4 hover:text-teal-500 dark:hover:text-teal-600 smooth rounded-lg text-white border-2 border-teal-500 dark:border-teal-600 cursor-pointer",
    },
    600: {
      700: "bg-teal-600 dark:bg-teal-700 hover:bg-transparent p-2 px-4 hover:text-teal-600 dark:hover:text-teal-700 smooth rounded-lg text-white border-2 border-teal-600 dark:border-teal-700 cursor-pointer",
    },
    700: {
      800: "bg-teal-700 dark:bg-teal-800 hover:bg-transparent p-2 px-4 hover:text-teal-700 dark:hover:text-teal-800 smooth rounded-lg text-white border-2 border-teal-700 dark:border-teal-800 cursor-pointer",
    },
    800: {
      900: "bg-teal-800 dark:bg-teal-900 hover:bg-transparent p-2 px-4 hover:text-teal-800 dark:hover:text-teal-900 smooth rounded-lg text-white border-2 border-teal-800 dark:border-teal-900 cursor-pointer",
    },
  },
  amber: {
    100: {
      200: "bg-amber-100 dark:bg-amber-200 hover:bg-transparent p-2 px-4 hover:text-amber-100 dark:hover:text-amber-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-amber-100 dark:border-amber-200 cursor-pointer",
    },
    200: {
      300: "bg-amber-200 dark:bg-amber-300 hover:bg-transparent p-2 px-4 hover:text-amber-200 dark:hover:text-amber-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-amber-200 dark:border-amber-300 cursor-pointer",
    },
    300: {
      400: "bg-amber-300 dark:bg-amber-400 hover:bg-transparent p-2 px-4 hover:text-amber-300 dark:hover:text-amber-400 smooth rounded-lg text-gray-800 dark:text-white border-2 border-amber-300 dark:border-amber-400 cursor-pointer",
    },
    400: {
      500: "bg-amber-400 dark:bg-amber-500 hover:bg-transparent p-2 px-4 hover:text-amber-400 dark:hover:text-amber-500 smooth rounded-lg text-gray-800 dark:text-white border-2 border-amber-400 dark:border-amber-500 cursor-pointer",
    },
    500: {
      600: "bg-amber-500 dark:bg-amber-600 hover:bg-transparent p-2 px-4 hover:text-amber-500 dark:hover:text-amber-600 smooth rounded-lg text-white border-2 border-amber-500 dark:border-amber-600 cursor-pointer",
    },
    600: {
      700: "bg-amber-600 dark:bg-amber-700 hover:bg-transparent p-2 px-4 hover:text-amber-600 dark:hover:text-amber-700 smooth rounded-lg text-white border-2 border-amber-600 dark:border-amber-700 cursor-pointer",
    },
    700: {
      800: "bg-amber-700 dark:bg-amber-800 hover:bg-transparent p-2 px-4 hover:text-amber-700 dark:hover:text-amber-800 smooth rounded-lg text-white border-2 border-amber-700 dark:border-amber-800 cursor-pointer",
    },
    800: {
      900: "bg-amber-800 dark:bg-amber-900 hover:bg-transparent p-2 px-4 hover:text-amber-800 dark:hover:text-amber-900 smooth rounded-lg text-white border-2 border-amber-800 dark:border-amber-900 cursor-pointer",
    },
  },
  pink: {
    100: {
      200: "bg-pink-100 dark:bg-pink-200 hover:bg-transparent p-2 px-4 hover:text-pink-100 dark:hover:text-pink-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-pink-100 dark:border-pink-200 cursor-pointer",
    },
    200: {
      300: "bg-pink-200 dark:bg-pink-300 hover:bg-transparent p-2 px-4 hover:text-pink-200 dark:hover:text-pink-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-pink-200 dark:border-pink-300 cursor-pointer",
    },
    300: {
      400: "bg-pink-300 dark:bg-pink-400 hover:bg-transparent p-2 px-4 hover:text-pink-300 dark:hover:text-pink-400 smooth rounded-lg text-white border-2 border-pink-300 dark:border-pink-400 cursor-pointer",
    },
    400: {
      500: "bg-pink-400 dark:bg-pink-500 hover:bg-transparent p-2 px-4 hover:text-pink-400 dark:hover:text-pink-500 smooth rounded-lg text-white border-2 border-pink-400 dark:border-pink-500 cursor-pointer",
    },
    500: {
      600: "bg-pink-500 dark:bg-pink-600 hover:bg-transparent p-2 px-4 hover:text-pink-500 dark:hover:text-pink-600 smooth rounded-lg text-white border-2 border-pink-500 dark:border-pink-600 cursor-pointer",
    },
    600: {
      700: "bg-pink-600 dark:bg-pink-700 hover:bg-transparent p-2 px-4 hover:text-pink-600 dark:hover:text-pink-700 smooth rounded-lg text-white border-2 border-pink-600 dark:border-pink-700 cursor-pointer",
    },
    700: {
      800: "bg-pink-700 dark:bg-pink-800 hover:bg-transparent p-2 px-4 hover:text-pink-700 dark:hover:text-pink-800 smooth rounded-lg text-white border-2 border-pink-700 dark:border-pink-800 cursor-pointer",
    },
    800: {
      900: "bg-pink-800 dark:bg-pink-900 hover:bg-transparent p-2 px-4 hover:text-pink-800 dark:hover:text-pink-900 smooth rounded-lg text-white border-2 border-pink-800 dark:border-pink-900 cursor-pointer",
    },
  },
  fuchsia: {
    100: {
      200: "bg-fuchsia-100 dark:bg-fuchsia-200 hover:bg-transparent p-2 px-4 hover:text-fuchsia-100 dark:hover:text-fuchsia-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-fuchsia-100 dark:border-fuchsia-200 cursor-pointer",
    },
    200: {
      300: "bg-fuchsia-200 dark:bg-fuchsia-300 hover:bg-transparent p-2 px-4 hover:text-fuchsia-200 dark:hover:text-fuchsia-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-fuchsia-200 dark:border-fuchsia-300 cursor-pointer",
    },
    300: {
      400: "bg-fuchsia-300 dark:bg-fuchsia-400 hover:bg-transparent p-2 px-4 hover:text-fuchsia-300 dark:hover:text-fuchsia-400 smooth rounded-lg text-white border-2 border-fuchsia-300 dark:border-fuchsia-400 cursor-pointer",
    },
    400: {
      500: "bg-fuchsia-400 dark:bg-fuchsia-500 hover:bg-transparent p-2 px-4 hover:text-fuchsia-400 dark:hover:text-fuchsia-500 smooth rounded-lg text-white border-2 border-fuchsia-400 dark:border-fuchsia-500 cursor-pointer",
    },
    500: {
      600: "bg-fuchsia-500 dark:bg-fuchsia-600 hover:bg-transparent p-2 px-4 hover:text-fuchsia-500 dark:hover:text-fuchsia-600 smooth rounded-lg text-white border-2 border-fuchsia-500 dark:border-fuchsia-600 cursor-pointer",
    },
    600: {
      700: "bg-fuchsia-600 dark:bg-fuchsia-700 hover:bg-transparent p-2 px-4 hover:text-fuchsia-600 dark:hover:text-fuchsia-700 smooth rounded-lg text-white border-2 border-fuchsia-600 dark:border-fuchsia-700 cursor-pointer",
    },
    700: {
      800: "bg-fuchsia-700 dark:bg-fuchsia-800 hover:bg-transparent p-2 px-4 hover:text-fuchsia-700 dark:hover:text-fuchsia-800 smooth rounded-lg text-white border-2 border-fuchsia-700 dark:border-fuchsia-800 cursor-pointer",
    },
    800: {
      900: "bg-fuchsia-800 dark:bg-fuchsia-900 hover:bg-transparent p-2 px-4 hover:text-fuchsia-800 dark:hover:text-fuchsia-900 smooth rounded-lg text-white border-2 border-fuchsia-800 dark:border-fuchsia-900 cursor-pointer",
    },
  },
  violet: {
    100: {
      200: "bg-violet-100 dark:bg-violet-200 hover:bg-transparent p-2 px-4 hover:text-violet-100 dark:hover:text-violet-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-violet-100 dark:border-violet-200 cursor-pointer",
    },
    200: {
      300: "bg-violet-200 dark:bg-violet-300 hover:bg-transparent p-2 px-4 hover:text-violet-200 dark:hover:text-violet-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-violet-200 dark:border-violet-300 cursor-pointer",
    },
    300: {
      400: "bg-violet-300 dark:bg-violet-400 hover:bg-transparent p-2 px-4 hover:text-violet-300 dark:hover:text-violet-400 smooth rounded-lg text-white border-2 border-violet-300 dark:border-violet-400 cursor-pointer",
    },
    400: {
      500: "bg-violet-400 dark:bg-violet-500 hover:bg-transparent p-2 px-4 hover:text-violet-400 dark:hover:text-violet-500 smooth rounded-lg text-white border-2 border-violet-400 dark:border-violet-500 cursor-pointer",
    },
    500: {
      600: "bg-violet-500 dark:bg-violet-600 hover:bg-transparent p-2 px-4 hover:text-violet-500 dark:hover:text-violet-600 smooth rounded-lg text-white border-2 border-violet-500 dark:border-violet-600 cursor-pointer",
    },
    600: {
      700: "bg-violet-600 dark:bg-violet-700 hover:bg-transparent p-2 px-4 hover:text-violet-600 dark:hover:text-violet-700 smooth rounded-lg text-white border-2 border-violet-600 dark:border-violet-700 cursor-pointer",
    },
    700: {
      800: "bg-violet-700 dark:bg-violet-800 hover:bg-transparent p-2 px-4 hover:text-violet-700 dark:hover:text-violet-800 smooth rounded-lg text-white border-2 border-violet-700 dark:border-violet-800 cursor-pointer",
    },
    800: {
      900: "bg-violet-800 dark:bg-violet-900 hover:bg-transparent p-2 px-4 hover:text-violet-800 dark:hover:text-violet-900 smooth rounded-lg text-white border-2 border-violet-800 dark:border-violet-900 cursor-pointer",
    },
  },
  gray: {
    100: {
      200: "bg-gray-100 dark:bg-gray-200 hover:bg-transparent p-2 px-4 hover:text-gray-100 dark:hover:text-gray-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-gray-100 dark:border-gray-200 cursor-pointer",
    },
    200: {
      300: "bg-gray-200 dark:bg-gray-300 hover:bg-transparent p-2 px-4 hover:text-gray-200 dark:hover:text-gray-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-300 cursor-pointer",
    },
    300: {
      400: "bg-gray-300 dark:bg-gray-400 hover:bg-transparent p-2 px-4 hover:text-gray-300 dark:hover:text-gray-400 smooth rounded-lg text-gray-800 dark:text-white border-2 border-gray-300 dark:border-gray-400 cursor-pointer",
    },
    400: {
      500: "bg-gray-400 dark:bg-gray-500 hover:bg-transparent p-2 px-4 hover:text-gray-400 dark:hover:text-gray-500 smooth rounded-lg text-white border-2 border-gray-400 dark:border-gray-500 cursor-pointer",
    },
    500: {
      600: "bg-gray-500 dark:bg-gray-600 hover:bg-transparent p-2 px-4 hover:text-gray-500 dark:hover:text-gray-600 smooth rounded-lg text-white border-2 border-gray-500 dark:border-gray-600 cursor-pointer",
    },
    600: {
      700: "bg-gray-600 dark:bg-gray-700 hover:bg-transparent p-2 px-4 hover:text-gray-600 dark:hover:text-gray-700 smooth rounded-lg text-white border-2 border-gray-600 dark:border-gray-700 cursor-pointer",
    },
    700: {
      800: "bg-gray-700 dark:bg-gray-800 hover:bg-transparent p-2 px-4 hover:text-gray-700 dark:hover:text-gray-800 smooth rounded-lg text-white border-2 border-gray-700 dark:border-gray-800 cursor-pointer",
    },
    800: {
      900: "bg-gray-800 dark:bg-gray-900 hover:bg-transparent p-2 px-4 hover:text-gray-800 dark:hover:text-gray-900 smooth rounded-lg text-white border-2 border-gray-800 dark:border-gray-900 cursor-pointer",
    },
  },
  slate: {
    100: {
      200: "bg-slate-100 dark:bg-slate-200 hover:bg-transparent p-2 px-4 hover:text-slate-100 dark:hover:text-slate-200 smooth rounded-lg text-gray-800 dark:text-white border-2 border-slate-100 dark:border-slate-200 cursor-pointer",
    },
    200: {
      300: "bg-slate-200 dark:bg-slate-300 hover:bg-transparent p-2 px-4 hover:text-slate-200 dark:hover:text-slate-300 smooth rounded-lg text-gray-800 dark:text-white border-2 border-slate-200 dark:border-slate-300 cursor-pointer",
    },
    300: {
      400: "bg-slate-300 dark:bg-slate-400 hover:bg-transparent p-2 px-4 hover:text-slate-300 dark:hover:text-slate-400 smooth rounded-lg text-gray-800 dark:text-white border-2 border-slate-300 dark:border-slate-400 cursor-pointer",
    },
    400: {
      500: "bg-slate-400 dark:bg-slate-500 hover:bg-transparent p-2 px-4 hover:text-slate-400 dark:hover:text-slate-500 smooth rounded-lg text-white border-2 border-slate-400 dark:border-slate-500 cursor-pointer",
    },
    500: {
      600: "bg-slate-500 dark:bg-slate-600 hover:bg-transparent p-2 px-4 hover:text-slate-500 dark:hover:text-slate-600 smooth rounded-lg text-white border-2 border-slate-500 dark:border-slate-600 cursor-pointer",
    },
    600: {
      700: "bg-slate-600 dark:bg-slate-700 hover:bg-transparent p-2 px-4 hover:text-slate-600 dark:hover:text-slate-700 smooth rounded-lg text-white border-2 border-slate-600 dark:border-slate-700 cursor-pointer",
    },
    700: {
      800: "bg-slate-700 dark:bg-slate-800 hover:bg-transparent p-2 px-4 hover:text-slate-700 dark:hover:text-slate-800 smooth rounded-lg text-white border-2 border-slate-700 dark:border-slate-800 cursor-pointer",
    },
    800: {
      900: "bg-slate-800 dark:bg-slate-900 hover:bg-transparent p-2 px-4 hover:text-slate-800 dark:hover:text-slate-900 smooth rounded-lg text-white border-2 border-slate-800 dark:border-slate-900 cursor-pointer",
    },
  },
};

const Button = ({
  color = "sky",
  shade = 400,
  darkShade,
  text,
  icon,
  onClick,
  className,
  rtl = false,
  full,
  isLoading = false,
  loadingIcon = "line-md:loading-twotone-loop",
  ...props
}) => {
  const actualDarkShade = darkShade || shade + 100;

  let buttonClasses = "";
  if (
    colorVariants[color] &&
    colorVariants[color][shade] &&
    colorVariants[color][shade][actualDarkShade]
  ) {
    buttonClasses = colorVariants[color][shade][actualDarkShade];
  } else {
    buttonClasses = colorVariants.sky[400][500];
  }

  const iconMarginClass = rtl ? "ml-2" : "mr-2";
  const flexDirection = rtl ? "flex-row-reverse" : "flex-row";
  const fullWidth = full ? "w-full" : "";

  const handleClick = (e) => {
    if (!isLoading && onClick) {
      onClick(e);
    }
  };

  const hasText = Boolean(text);

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center ${
        hasText ? "justify-center" : "justify-center"
      } ${flexDirection} ${fullWidth} ${buttonClasses + ""} ${
        isLoading ? "opacity-40 cursor-not-allowed" : ""
      } ${className || ""} `}
      dir={rtl ? "rtl" : "ltr"}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span
          className={`inline-flex items-center ${
            hasText ? iconMarginClass : "mx-auto"
          }`}
        >
          <Icon
            icon={loadingIcon}
            className="inline-block animate-spin text-xl"
          />
        </span>
      ) : icon ? (
        <span
          className={`inline-flex items-center ${
            hasText ? iconMarginClass : ""
          }`}
        >
          <Icon icon={icon} className="inline-block" />
        </span>
      ) : null}

      {hasText && <span className="inline-block">{text}</span>}
    </button>
  );
};

// Example usage component
const ButtonWithLoading = ({
  onClick,
  text,
  icon,
  loadingText = "",
  ...props
}) => {
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async (e) => {
    if (onClick) {
      setLoading(true);
      try {
        await onClick(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      onClick={handleButtonClick}
      text={loading ? loadingText : text}
      icon={icon}
      isLoading={loading}
      {...props}
    />
  );
};

export { Button, ButtonWithLoading };
