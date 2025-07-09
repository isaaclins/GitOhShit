/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main/preload.ts":
/*!*****************************!*\
  !*** ./src/main/preload.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n\n// Expose protected methods that allow the renderer process to use\n// the ipcRenderer without exposing the entire object\nconst electronAPI = {\n    // Menu event listeners\n    onMenuOpenRepository: (callback) => {\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu-open-repository', callback);\n    },\n    onMenuCloseRepository: (callback) => {\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu-close-repository', callback);\n    },\n    onMenuViewLinear: (callback) => {\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu-view-linear', callback);\n    },\n    onMenuViewTree: (callback) => {\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu-view-tree', callback);\n    },\n    onMenuViewTimeline: (callback) => {\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu-view-timeline', callback);\n    },\n    // Git operations\n    openRepository: (path) => {\n        return electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('git-open-repository', path);\n    },\n    getCommitHistory: (repoPath) => {\n        return electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('git-get-commit-history', repoPath);\n    },\n    editCommit: (repoPath, commitHash, changes) => {\n        return electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('git-edit-commit', repoPath, commitHash, changes);\n    },\n    // File system operations\n    selectDirectory: () => {\n        return electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('dialog-select-directory');\n    },\n    // Utility functions\n    removeAllListeners: (channel) => {\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeAllListeners(channel);\n    }\n};\n// Expose the API to the renderer process\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electronAPI', electronAPI);\n\n\n//# sourceURL=webpack://git-o-shit/./src/main/preload.ts?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/preload.ts");
/******/ 	
/******/ })()
;