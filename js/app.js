/* 広島・宮島 旅のしおり — アプリロジック
   データ本体: Firebase Firestore（js/firebase-config.js が設定済みの場合）
   フォールバック: data/itinerary.json（Firebase未設定でも従来どおり表示）
   絵文字アイコンは FLAT_ICONS で Material Symbols Rounded のSVGに変換されます */

import firebaseConfig from "./firebase-config.js";

// ---- Material Symbols Rounded アイコン（絵文字 → SVG 変換マップ） ----
// 出典: https://fonts.google.com/icons?icon.style=Rounded （24px/weight400/fill0）
const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"';

const FLAT_ICONS = {
  "🛬": `<svg ${SVG_ATTRS}><path d="M160-120q-17 0-28.5-11.5T120-160q0-17 11.5-28.5T160-200h640q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120H160Zm582-202L178-482q-26-8-42-29t-16-48v-177q0-20 16-32t36-7l23 6q10 3 17.5 9.5T223-743l41 119 138 39-28-271q-3-26 17.5-42.5T437-907l21 6q11 3 19.5 11.5T490-870l120 345 172 49q25 8 41.5 29t16.5 48q0 35-28.5 61.5T742-322Z"/></svg>`, // flight_land
  "🛫": `<svg ${SVG_ATTRS}><path d="M808-487 248-336q-26 7-50.5-3T159-372L68-524q-11-17-3.5-36T92-584l23-6q10-2 19.5-.5T152-582l96 80 140-37-163-218q-16-21-8-45.5t34-31.5l21-5q11-3 23.5-1t21.5 10l279 235 170-46q32-9 60.5 7.5T864-585q9 32-7.5 60.5T808-487ZM160-120q-17 0-28.5-11.5T120-160q0-17 11.5-28.5T160-200h640q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120H160Z"/></svg>`, // flight_takeoff
  "🚗": `<svg ${SVG_ATTRS}><path d="M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z"/></svg>`, // directions_car
  "🥢": `<svg ${SVG_ATTRS}><path d="M211.5-131.5Q200-143 200-160v-360q-33 0-56.5-23.5T120-600v-212q0-12 8-20t20-8q12 0 20 8t8 20v132h36v-132q0-12 8-20t20-8q12 0 20 8t8 20v132h36v-132q0-12 8-20t20-8q12 0 20 8t8 20v212q0 33-23.5 56.5T280-520v360q0 17-11.5 28.5T240-120q-17 0-28.5-11.5Zm280 0Q480-143 480-160v-364q-42-20-61-62.5T400-676q0-63 31.5-113.5T520-840q57 0 88.5 50.5T640-676q0 47-19 89.5T560-524v364q0 17-11.5 28.5T520-120q-17 0-28.5-11.5Zm200 0Q680-143 680-160v-633q0-17 11-28.5t28-11.5q45 0 83 48t38 105v200q0 17-11.5 28.5T800-440h-40v280q0 17-11.5 28.5T720-120q-17 0-28.5-11.5Z"/></svg>`, // flatware
  "🕊️": `<svg ${SVG_ATTRS}><path d="M475-160q4 0 8-2t6-4l328-328q12-12 17.5-27t5.5-30q0-16-5.5-30.5T817-607L647-777q-11-12-25.5-17.5T591-800q-15 0-30 5.5T534-777l-11 11 74 75q15 14 22 32t7 38q0 42-28.5 70.5T527-522q-20 0-38.5-7T456-550l-75-74-175 175q-3 3-4.5 6.5T200-435q0 8 6 14.5t14 6.5q4 0 8-2t6-4l108-108q11-11 27.5-11.5T398-528q11 11 11 28t-11 28L291-364q-3 3-4.5 6.5T285-350q0 8 6 14t14 6q4 0 8-2t6-4l108-107q11-11 27.5-11.5T483-443q11 11 11 28t-11 28L376-279q-3 2-4.5 6t-1.5 8q0 8 6 14t14 6q4 0 7.5-1.5t6.5-4.5l108-107q11-11 27.5-11.5T568-358q11 11 11 28t-11 28L460-194q-3 3-4.5 6.5T454-180q0 8 6.5 14t14.5 6Zm-1 80q-37 0-65.5-24.5T375-166q-34-5-57-28t-28-57q-34-5-56.5-28.5T206-336q-38-5-62-33t-24-66q0-20 7.5-38.5T149-506l175-175q23-23 56.5-23t56.5 23l75 75q2 3 6 4.5t8 1.5q9 0 15-5.5t6-14.5q0-4-1.5-8t-4.5-6L398-777q-11-12-25.5-17.5T342-800q-15 0-30 5.5T285-777L144-635q-14 14-20 33t-3 38q3 17-7 30t-27 15q-17 2-30-7.5T42-553q-6-38 5.5-74.5T87-692l141-141q24-23 53.5-35t60.5-12q31 0 60.5 12t52.5 35l11 11 11-11q24-23 53.5-35t60.5-12q31 0 60.5 12t52.5 35l169 169q23 23 35 53t12 61q0 31-12 60.5T873-437L545-110q-14 14-32.5 22T474-80Zm-98-560Z"/></svg>`, // handshake
  "🏯": `<svg ${SVG_ATTRS}><path d="M40-200v-360q0-17 11.5-28.5T80-600q17 0 28.5 11.5T120-560v40h80v-280q0-17 11.5-28.5T240-840q17 0 28.5 11.5T280-800v40h80v-40q0-17 11.5-28.5T400-840q17 0 28.5 11.5T440-800v40h80v-40q0-17 11.5-28.5T560-840q17 0 28.5 11.5T600-800v40h80v-40q0-17 11.5-28.5T720-840q17 0 28.5 11.5T760-800v280h80v-40q0-17 11.5-28.5T880-600q17 0 28.5 11.5T920-560v360q0 33-23.5 56.5T840-120H600q-17 0-28.5-11.5T560-160v-80q0-33-23.5-56.5T480-320q-33 0-56.5 23.5T400-240v80q0 17-11.5 28.5T360-120H120q-33 0-56.5-23.5T40-200Zm80 0h200v-40q0-66 47-113t113-47q66 0 113 47t47 113v40h200v-240H720q-17 0-28.5-11.5T680-480v-200H280v200q0 17-11.5 28.5T240-440H120v240Zm250-280h60q5 0 7.5-2.5t2.5-7.5v-70q0-17-11.5-28.5T400-600q-17 0-28.5 11.5T360-560v70q0 5 2.5 7.5t7.5 2.5Zm160 0h60q5 0 7.5-2.5t2.5-7.5v-70q0-17-11.5-28.5T560-600q-17 0-28.5 11.5T520-560v70q0 5 2.5 7.5t7.5 2.5Zm-50 40Z"/></svg>`, // castle
  "🏨": `<svg ${SVG_ATTRS}><path d="M80-200q-17 0-28.5-11.5T40-240v-520q0-17 11.5-28.5T80-800q17 0 28.5 11.5T120-760v360h320v-240q0-33 23.5-56.5T520-720h240q66 0 113 47t47 113v320q0 17-11.5 28.5T880-200q-17 0-28.5-11.5T840-240v-80H120v80q0 17-11.5 28.5T80-200Zm115-275q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35Zm325 75h320v-160q0-33-23.5-56.5T760-640H520v240ZM308.5-531.5Q320-543 320-560t-11.5-28.5Q297-600 280-600t-28.5 11.5Q240-577 240-560t11.5 28.5Q263-520 280-520t28.5-11.5ZM280-560Zm240-80v240-240Z"/></svg>`, // hotel
  "🍽️": `<svg ${SVG_ATTRS}><path d="M280-600v-240q0-17 11.5-28.5T320-880q17 0 28.5 11.5T360-840v240h40v-240q0-17 11.5-28.5T440-880q17 0 28.5 11.5T480-840v240q0 56-34.5 98T360-446v326q0 17-11.5 28.5T320-80q-17 0-28.5-11.5T280-120v-326q-51-14-85.5-56T160-600v-240q0-17 11.5-28.5T200-880q17 0 28.5 11.5T240-840v240h40Zm400 200h-80q-17 0-28.5-11.5T560-440v-240q0-70 51.5-135T718-880q18 0 30 14t12 33v713q0 17-11.5 28.5T720-80q-17 0-28.5-11.5T680-120v-280Z"/></svg>`, // restaurant
  "⚓": `<svg ${SVG_ATTRS}><path d="M355-102q-64-22-116-60t-85.5-89Q120-302 120-360v-80q0-12 11-18t21 2l91 68q14 11 15.5 29.5T247-327l-29 29q29 51 92 88t130 47v-357h-80q-17 0-28.5-11.5T320-560q0-17 11.5-28.5T360-600h80v-47q-35-13-57.5-43.5T360-760q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 69.5T520-647v47h80q17 0 28.5 11.5T640-560q0 17-11.5 28.5T600-520h-80v357q67-10 130-47t92-88l-29-29q-13-13-11.5-31.5T717-388l91-68q10-8 21-2t11 18v80q0 58-33.5 109T721-162q-52 38-116 60T480-80q-61 0-125-22Zm125-618q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720Z"/></svg>`, // anchor
  "☕": `<svg ${SVG_ATTRS}><path d="M200-120q-17 0-28.5-11.5T160-160q0-17 11.5-28.5T200-200h560q17 0 28.5 11.5T800-160q0 17-11.5 28.5T760-120H200Zm120-160q-66 0-113-47t-47-113v-320q0-33 23.5-56.5T240-840h560q33 0 56.5 23.5T880-760v120q0 33-23.5 56.5T800-560h-80v120q0 66-47 113t-113 47H320Zm0-80h240q33 0 56.5-23.5T640-440v-320H240v320q0 33 23.5 56.5T320-360Zm400-280h80v-120h-80v120ZM320-360h-80 400-320Z"/></svg>`, // local_cafe
  "🅿️": `<svg ${SVG_ATTRS}><path d="M400-360v160q0 33-23.5 56.5T320-120q-33 0-56.5-23.5T240-200v-560q0-33 23.5-56.5T320-840h200q100 0 170 70t70 170q0 100-70 170t-170 70H400Zm0-160h128q33 0 56.5-23.5T608-600q0-33-23.5-56.5T528-680H400v160Z"/></svg>`, // local_parking
  "🚢": `<svg ${SVG_ATTRS}><path d="M411.5-89Q379-97 339-116q-47 19-89.5 26T160-81q-17 1-28.5-10.5T120-120q0-17 11.5-28.5T160-161q24-1 44.5-3t40.5-6.5q20-4.5 41-11.5t45-17q5-2 10-2t10 2q33 17 60.5 28t68.5 11q41 0 68.5-11t60.5-28q5-2 10-2t10 2q24 10 45 17t41 11.5q20 4.5 41 6.5t44 3q17 1 28.5 12.5T840-120q0 17-11.5 28.5T800-81q-47-2-89.5-9T622-116q-40 19-73 27t-69 8q-36 0-68.5-8ZM480-240q-60 0-105-40l-45-40q-19 18-40.5 32.5T245-262q-19 8-37.5-2T183-294l-70-226q-5-17 3-31t25-19l59-16v-134q0-33 23.5-56.5T280-800h100v-40q0-17 11.5-28.5T420-880h120q17 0 28.5 11.5T580-840v40h100q33 0 56.5 23.5T760-720v134l59 16q17 5 25 19t3 31l-70 226q-6 20-24.5 30t-37.5 2q-24-11-45.5-25.5T630-320l-45 40q-45 40-105 40ZM280-720v113l180-48q10-3 20-3t20 3l180 48v-113H280Zm200 143-278 73 46 149q15-12 28.5-24.5T304-406q12-13 29.5-12.5T362-404q23 27 52 55.5t68 28.5q38 0 66-29t51-55q11-14 28.5-14.5T657-406q14 14 27.5 26.5T713-355l46-149-279-73Zm1 128Z"/></svg>`, // directions_boat
  "🍷": `<svg ${SVG_ATTRS}><path d="M440-200v-164q-86-14-143-80t-57-156v-200q0-17 11.5-28.5T280-840h400q17 0 28.5 11.5T720-800v200q0 90-57 156t-143 80v164h80q17 0 28.5 11.5T640-160q0 17-11.5 28.5T600-120H360q-17 0-28.5-11.5T320-160q0-17 11.5-28.5T360-200h80Zm138-274q42-34 56-86H326q14 52 56 86t98 34q56 0 98-34ZM320-640h320v-120H320v120Zm160 200Z"/></svg>`, // wine_bar
  "🌙": `<svg ${SVG_ATTRS}><path d="M480-120q-151 0-255.5-104.5T120-480q0-138 90-239.5T440-838q13-2 23 3.5t16 14.5q6 9 6.5 21t-7.5 23q-17 26-25.5 55t-8.5 61q0 90 63 153t153 63q31 0 61.5-9t54.5-25q11-7 22.5-6.5T819-479q10 5 15.5 15t3.5 24q-14 138-117.5 229T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/></svg>`, // dark_mode
  "⛩️": `<svg ${SVG_ATTRS}><path d="M160-160v-286q-52-13-86-55t-34-98q0-17 11.5-28.5T80-639q17 0 28.5 11.5T120-599q0 32 23.5 55.5T199-520h41v-86q-52-13-86-55t-34-98q0-17 11.5-28.5T160-799q17 0 28.5 11.5T200-759q0 32 23.5 55.5T279-680h21l116-155q12-16 29-24t35-8q18 0 35 8t29 24l116 155h21q32 0 55.5-23.5T760-759q0-17 11.5-28.5T800-799q17 0 28.5 11.5T840-759q0 56-34 98t-86 55v86h41q32 0 55.5-23.5T840-599q0-17 11.5-28.5T880-639q17 0 28.5 11.5T920-599q0 56-34 98t-86 55v286q0 33-23.5 56.5T720-80H560q-17 0-28.5-11.5T520-120v-120q0-17-11.5-28.5T480-280q-17 0-28.5 11.5T440-240v120q0 17-11.5 28.5T400-80H240q-33 0-56.5-23.5T160-160Zm240-520h160l-80-107-80 107Zm-80 160h320v-80H320v80Zm-80 360h120v-80q0-50 35-85t85-35q50 0 85 35t35 85v80h120v-280H240v280Zm240-280Zm0-240Zm0 160Z"/></svg>`, // temple_buddhist
  "🍳": `<svg ${SVG_ATTRS}><path d="M640-80q-67 0-101.5-22.5T480-150q-19-20-36.5-35T399-200q-45 0-100-15.5t-103.5-51Q147-302 114-359T80-499q-2-167 82.5-274T399-880q71 0 120 20.5t84.5 51.5q35.5 31 60 68.5T710-667q12 20 24 36.5t26 30.5q60 60 90 105t30 136q0 120-74.5 199.5T640-80Zm0-80q57 0 108.5-56.5T800-359q0-66-19.5-97T704-544q-21-20-37.5-44.5T633-639q-41-65-87-113t-147-48q-129 0-185 92.5T160-500q1 67 29 110t66.5 67.5Q294-298 334-289t65 9q51 0 82 24.5t51 45.5q22 23 42.5 36.5T640-160ZM480-340q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Zm-1-140Z"/></svg>`, // egg_alt
  "🚡": `<svg ${SVG_ATTRS}><path d="M200-120q-33 0-56.5-23.5T120-200v-240q0-66 47-113t113-47h160v-109L89-613q-18 5-33.5-6.5T40-651q0-13 7.5-23T68-688l177-48q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T300-820q23 0 40 15t19 38l81-22v-11q0-17 11.5-28.5T480-840q14 0 24.5 8t14.5 21l87-23q-3-6-4.5-12.5T600-860q0-25 17.5-42.5T660-920q23 0 40.5 16t19.5 39l151-42q18-5 33.5 6.5T920-869q0 13-7.5 23T892-832L520-731v131h160q66 0 113 47t47 113v240q0 33-23.5 56.5T760-120H200Zm0-80h560v-80H200v80Zm0-160h133v-160h-53q-33 0-56.5 23.5T200-440v80Zm213 0h133v-160H413v160Zm214 0h133v-80q0-33-23.5-56.5T680-520h-53v160ZM200-200v-80 80Z"/></svg>`, // gondola_lift
  "🍰": `<svg ${SVG_ATTRS}><path d="M160-80q-17 0-28.5-11.5T120-120v-200q0-33 23.5-56.5T200-400v-160q0-33 23.5-56.5T280-640h160v-58q-18-12-29-29t-11-41q0-15 6-29.5t18-26.5l42-42q2-2 14-6 2 0 14 6l42 42q12 12 18 26.5t6 29.5q0 24-11 41t-29 29v58h160q33 0 56.5 23.5T760-560v160q33 0 56.5 23.5T840-320v200q0 17-11.5 28.5T800-80H160Zm120-320h400v-160H280v160Zm-80 240h560v-160H200v160Zm80-240h400-400Zm-80 240h560-560Zm560-240H200h560Z"/></svg>`, // cake
  "⛽": `<svg ${SVG_ATTRS}><path d="M160-160v-600q0-33 23.5-56.5T240-840h240q33 0 56.5 23.5T560-760v280h40q33 0 56.5 23.5T680-400v180q0 17 11.5 28.5T720-180q17 0 28.5-11.5T760-220v-288q-9 5-19 6.5t-21 1.5q-42 0-71-29t-29-71q0-32 17.5-57.5T684-694l-63-63q-9-9-9-21t9-21q8-8 20.5-8.5T663-800l127 124q15 15 22.5 35t7.5 41v380q0 42-29 71t-71 29q-42 0-71-29t-29-71v-200h-60v260q0 17-11.5 28.5T520-120H200q-17 0-28.5-11.5T160-160Zm80-400h240v-200H240v200Zm480 0q17 0 28.5-11.5T760-600q0-17-11.5-28.5T720-640q-17 0-28.5 11.5T680-600q0 17 11.5 28.5T720-560ZM240-200h240v-280H240v280Zm240 0H240h240Z"/></svg>`, // local_gas_station
  "🧳": `<svg ${SVG_ATTRS}><path d="M280-120q-33 0-56.5-23.5T200-200v-440q0-33 23.5-56.5T280-720h80v-80q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v80h80q33 0 56.5 23.5T760-640v440q0 33-23.5 56.5T680-120q0 17-11.5 28.5T640-80q-17 0-28.5-11.5T600-120H360q0 17-11.5 28.5T320-80q-17 0-28.5-11.5T280-120Zm0-80h400v-440H280v440Zm91.5-388.5Q360-577 360-560v280q0 17 11.5 28.5T400-240q17 0 28.5-11.5T440-280v-280q0-17-11.5-28.5T400-600q-17 0-28.5 11.5Zm160 0Q520-577 520-560v280q0 17 11.5 28.5T560-240q17 0 28.5-11.5T600-280v-280q0-17-11.5-28.5T560-600q-17 0-28.5 11.5ZM440-720h80v-80h-80v80Zm40 300Z"/></svg>`, // luggage
  "🛍️": `<svg ${SVG_ATTRS}><path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z"/></svg>`, // shopping_bag
  "📍": `<svg ${SVG_ATTRS}><path d="M480-186q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm-28 74q-14-5-25-15-65-60-115-117t-83.5-110.5q-33.5-53.5-51-103T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 45-17.5 94.5t-51 103Q698-301 648-244T533-127q-11 10-25 15t-28 5q-14 0-28-5Zm28-448Zm56.5 56.5Q560-527 560-560t-23.5-56.5Q513-640 480-640t-56.5 23.5Q400-593 400-560t23.5 56.5Q447-480 480-480t56.5-23.5Z"/></svg>`, // location_on
  "✕": `<svg ${SVG_ATTRS}><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>`, // close
  "🚶": `<svg ${SVG_ATTRS}><path d="M436-364 371-72q-3 14-14.5 23T330-40q-20 0-32-15t-8-34l102-515-72 28v96q0 17-11.5 28.5T280-440q-17 0-28.5-11.5T240-480v-122q0-12 6.5-21.5T264-638l178-76q14-6 29.5-7t29.5 4q14 5 26.5 14t20.5 23l40 64q13 20 30.5 38t39.5 31q14 8 31 14.5t34 9.5q16 3 26.5 14.5T760-480q0 17-12 28t-29 9q-56-8-100.5-35T541-543l-25 123 72 68q6 6 9 13.5t3 15.5v243q0 17-11.5 28.5T560-40q-17 0-28.5-11.5T520-80v-220l-84-64Zm47.5-399.5Q460-787 460-820t23.5-56.5Q507-900 540-900t56.5 23.5Q620-853 620-820t-23.5 56.5Q573-740 540-740t-56.5-23.5Z"/></svg>`, // directions_walk
  "🗼": `<svg ${SVG_ATTRS}><path d="M148-560q0 55 18.5 109.5T221-350q9 11 9 25.5T220-300q-10 10-24.5 9T172-303q-46-57-69-122T80-560q0-70 23-135t69-122q9-11 23.5-12t24.5 9q10 10 10 24.5t-9 25.5q-36 46-54.5 100.5T148-560Zm132 0q0 29 9 59t29 56q8 11 8 25t-10 24q-10 10-24 9.5T269-398q-28-36-42.5-77.5T212-560q0-43 14.5-84.5T269-722q9-11 23-11.5t24 9.5q10 10 9.5 24t-8.5 25q-19 25-28 54.5t-9 60.5Zm107 400-18 54q-4 11-14 18.5T333-80q-20 0-31-15.5t-5-34.5l118-355q-16-14-25.5-33t-9.5-42q0-42 29-71t71-29q42 0 71 29t29 71q0 23-9.5 42T545-485l118 355q6 18-4.5 34T628-80q-12 0-22.5-7T591-106l-17-54H387Zm26-80h134l-67-200-67 200Zm267-320q0-29-9-59t-29-56q-8-11-8-25t10-24q10-10 24.5-9.5T691-722q27 36 41 77.5t16 84.5q0 43-14.5 84.5T691-398q-9 11-23 11.5t-24-9.5q-10-10-9.5-24t8.5-25q19-25 28-54.5t9-60.5Zm113.5-109.5Q775-724 739-770q-9-11-9-25.5t10-24.5q10-10 24.5-9t23.5 12q46 57 69 122t23 135q0 70-21.5 135T789-303q-10 11-24 12.5t-25-9.5q-10-10-10-24.5t9-25.5q36-46 54.5-100.5T812-560q0-55-18.5-109.5Z"/></svg>`, // cell_tower
  "🍜": `<svg ${SVG_ATTRS}><path d="M320-150q-98-38-169-112.5T80-440q0-17 11.5-28.5T120-480h40v-284q0-15 10-26t25-13l652-73q14-2 23.5 7t9.5 23q0 11-8 19.5t-19 9.5l-433 49v68h430q13 0 21.5 8.5T880-670q0 13-8.5 21.5T850-640H420v160h420q17 0 28.5 11.5T880-440q0 103-71 177.5T640-150v30q0 17-11.5 28.5T600-80H360q-17 0-28.5-11.5T320-120v-30Zm0-550h40v-61l-40 4v57Zm-100 0h40v-50l-40 4v46Zm100 220h40v-160h-40v160Zm-100 0h40v-160h-40v160Zm180 320h160v-44l50-20q61-24 108-69t68-107H174q21 62 68 107.5T350-224l50 20v44Zm80-240Z"/></svg>`, // ramen_dining
  "🍨": `<svg ${SVG_ATTRS}><path d="M120-560q0-51 29.5-92t74.5-58q18-91 89.5-150.5T480-920q95 0 166.5 59.5T736-710q45 17 74.5 58t29.5 92q0 75-53 119t-119 41L517-108q-5 11-14.5 16T482-87q-11 0-21-5t-15-16L294-400q-71 3-122.5-41T120-560Zm160 80q15 0 29.5-5t26.5-17l22-22 26 16q21 14 45.5 21t50.5 7q26 0 50.5-7t45.5-21l26-16 22 22q12 12 26.5 17t29.5 5q33 0 56.5-23.5T760-560q0-30-19-52.5T692-640l-30-4-2-32q-5-69-57-116.5T480-840q-71 0-123 47.5T300-676l-2 32-30 6q-30 6-49 27t-19 51q0 33 23.5 56.5T280-480Zm202 266 108-210q-24 12-52 18t-58 6q-27 0-54.5-6T372-424l110 210Zm-2-446Z"/></svg>`, // icecream
  "🖼️": `<svg ${SVG_ATTRS}><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Zm80-80h400q12 0 18-11t-2-21L586-459q-6-8-16-8t-16 8L450-320l-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11Z"/></svg>`, // image
  "🐠": `<svg ${SVG_ATTRS}><path d="M280-202q-49 0-78 22t-81 31q-17 3-29-8t-12-28q0-17 11.5-28.5T120-230q36-11 68-30.5t92-19.5q38 0 62.5 8.5t45.5 19q21 10.5 42 19.5t50 9q29 0 50-9t42-19.5q21-10.5 46-19t62-8.5q60 0 92 19.5t68 30.5q17 5 28.5 16.5T880-185q0 17-12 28t-29 8q-52-9-81-31t-78-22q-28 0-48.5 8.5t-41 19Q570-164 544.5-155t-64.5 9q-39 0-64.5-9t-46-19.5Q349-185 329-193.5t-49-8.5Zm0-178q-49 0-78 22t-81 31q-17 3-29-8t-12-28q0-17 11.5-28.5T120-408q36-11 68-30.5t92-19.5q38 0 62.5 8.5t45.5 19q21 10.5 42 19.5t50 9q29 0 50-9t42-19.5q21-10.5 46-19t62-8.5q60 0 92 19.5t68 30.5q17 5 28.5 16.5T880-363q0 17-12 28t-29 8q-52-9-81-31t-78-22q-29 0-49.5 8.5t-41 19Q569-342 544-333t-64 9q-39 0-64.5-9t-46-19.5Q349-363 329-371.5t-49-8.5Zm0-178q-49 0-78 22t-81 31q-17 3-29-8t-12-28q0-17 11.5-28.5T120-586q36-11 68-30.5t92-19.5q38 0 62.5 8.5t45.5 19q21 10.5 42 19.5t50 9q29 0 50-9t42-19.5q21-10.5 46-19t62-8.5q60 0 92 19.5t68 30.5q17 5 28.5 16.5T880-541q0 17-12 28t-29 8q-52-9-81-31t-78-22q-28 0-48.5 8.5t-41 19Q570-520 544.5-511t-64.5 9q-39 0-64.5-9t-46-19.5Q349-541 329-549.5t-49-8.5Zm0-178q-49 0-78 22t-81 31q-17 3-29-8t-12-28q0-17 11.5-28.5T120-764q36-11 68-30.5t92-19.5q38 0 62.5 8.5t45.5 19q21 10.5 42 19.5t50 9q29 0 50-9t42-19.5q21-10.5 46-19t62-8.5q60 0 92 19.5t68 30.5q17 5 28.5 16.5T880-719q0 17-12 28t-29 8q-52-9-81-31t-78-22q-28 0-48.5 8.5t-41 19Q570-698 544.5-689t-64.5 9q-39 0-64.5-9t-46-19.5Q349-719 329-727.5t-49-8.5Z"/></svg>`, // waves
  "🦪": `<svg ${SVG_ATTRS}><path d="M120-360q-33 0-56.5-23.5T40-440v-360q0-33 23.5-56.5T120-880h720q33 0 56.5 23.5T920-800v360q0 33-23.5 56.5T840-360H120Zm0-440v360h720v-360H120Zm692 544-659 34q-13 1-22-7t-10-21q-1-13 7.5-22t21.5-10l659-34q13-1 22 7t10 21q1 13-7.5 22T812-256Zm-2 135H150q-13 0-21.5-8.5T120-151q0-13 8.5-21.5T150-181h660q13 0 21.5 8.5T840-151q0 13-8.5 21.5T810-121ZM410-500q74 0 142.5-26T672-606q5 34 31 55t61 27q11 2 23.5.5T800-542v-156q0-17-12.5-18.5t-23.5.5q-35 7-61 28t-31 56q-53-52-120.5-80T410-740q-79 0-142 23.5T152-633q-1 1-5 13 0 4 5 13 53 60 116 83.5T410-500ZM120-800v360-360Z"/></svg>`, // set_meal
  "🛋️": `<svg ${SVG_ATTRS}><path d="M200-120q-17 0-28.5-11.5T160-160v-40q-50 0-85-35t-35-85v-200q0-50 35-85t85-35v-80q0-50 35-85t85-35h400q50 0 85 35t35 85v80q50 0 85 35t35 85v200q0 50-35 85t-85 35v40q0 17-11.5 28.5T760-120q-17 0-28.5-11.5T720-160v-40H240v40q0 17-11.5 28.5T200-120Zm-40-160h640q17 0 28.5-11.5T840-320v-200q0-17-11.5-28.5T800-560q-17 0-28.5 11.5T760-520v160H200v-160q0-17-11.5-28.5T160-560q-17 0-28.5 11.5T120-520v200q0 17 11.5 28.5T160-280Zm120-160h400v-80q0-27 11-49t29-39v-112q0-17-11.5-28.5T680-760H280q-17 0-28.5 11.5T240-720v112q18 17 29 39t11 49v80Zm200 0Zm0 160Zm0-80Z"/></svg>`, // chair
  "📞": `<svg ${SVG_ATTRS}><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"/></svg>`, // call
  "📶": `<svg ${SVG_ATTRS}><path d="M409-149q-29-29-29-71t29-71q29-29 71-29t71 29q29 29 29 71t-29 71q-29 29-71 29t-71-29Zm213.5-387Q690-512 745-470q20 15 20.5 39.5T748-388q-17 17-42 17.5T661-384q-38-26-84-41t-97-15q-51 0-97 15t-84 41q-20 14-45 13t-42-18q-17-18-17-42.5t20-39.5q55-42 122.5-65.5T480-560q75 0 142.5 24Zm93-223Q826-718 914-643q20 17 21 42t-17 43q-17 17-42 17.5T831-556q-72-59-161.5-91.5T480-680q-100 0-189.5 32.5T129-556q-20 16-45 15.5T42-558q-18-18-17-43t21-42q88-75 198.5-116T480-800q125 0 235.5 41Z"/></svg>`, // wifi
  "🔋": `<svg ${SVG_ATTRS}><path d="M660-200h-62q-12 0-17.5-10.5T582-231l100-143q5-6 11.5-4t6.5 10v88h62q12 0 17.5 10.5T778-249L678-106q-5 6-11.5 4t-6.5-10v-88Zm-300 40Zm-40 80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-40q0-17 11.5-28.5T440-880h80q17 0 28.5 11.5T560-840v40h80q17 0 28.5 11.5T680-760v240q0 17-11.5 28.5T640-480q-17 0-28.5-11.5T600-520v-200H360v560h101q17 0 28.5 11.5T501-120q0 17-11.5 28.5T461-80H320Z"/></svg>`, // battery_charging_full
  "⚡": `<svg ${SVG_ATTRS}><path d="m422-232 207-248H469l29-227-185 267h139l-30 208Zm-62-128H236q-24 0-35.5-21.5T203-423l299-430q10-14 26-19.5t33 .5q17 6 25 21t6 32l-32 259h155q26 0 36.5 23t-6.5 43L416-100q-11 13-27 17t-31-3q-15-7-23.5-21.5T328-139l32-221Zm111-110Z"/></svg>`, // bolt
  "🧷": `<svg ${SVG_ATTRS}><path d="m438-452-56-56q-12-12-28-12t-28 12q-12 12-12 28.5t12 28.5l84 85q12 12 28 12t28-12l170-170q12-12 12-28.5T636-593q-12-12-28.5-12T579-593L438-452Zm29 367q-6-1-12-3-135-45-215-166.5T160-516v-189q0-25 14.5-45t37.5-29l240-90q14-5 28-5t28 5l240 90q23 9 37.5 29t14.5 45v189q0 140-80 261.5T505-88q-6 2-12 3t-13 1q-7 0-13-1Zm13-79q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"/></svg>`, // verified_user
  "🪑": `<svg ${SVG_ATTRS}><path d="M200-160v-240q0-33 23.5-56.5T280-480h40v-80h-40q-33 0-56.5-23.5T200-640v-120q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v120q0 33-23.5 56.5T680-560h-40v80h40q33 0 56.5 23.5T760-400v240q0 17-11.5 28.5T720-120q-17 0-28.5-11.5T680-160v-80H280v80q0 17-11.5 28.5T240-120q-17 0-28.5-11.5T200-160Zm80-480h400v-120H280v120Zm120 160h160v-80H400v80ZM280-320h400v-80H280v80Zm0-320v-120 120Zm0 320v-80 80Z"/></svg>`, // chair_alt
  "🛄": `<svg ${SVG_ATTRS}><path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>`, // search
  "📠": `<svg ${SVG_ATTRS}><path d="M200-120q-50 0-85-35t-35-85v-280q0-50 35-85t85-35q27 0 49.5 11t39.5 29h31v-120q0-33 23.5-56.5T400-800h240q33 0 56.5 23.5T720-720v120h40q50 0 85 35t35 85v240q0 33-23.5 56.5T800-160H289q-17 18-39.5 29T200-120Zm0-80q17 0 28.5-11.5T240-240v-280q0-17-11.5-28.5T200-560q-17 0-28.5 11.5T160-520v280q0 17 11.5 28.5T200-200Zm200-400h240v-120H400v120Zm-80 360h480v-240q0-17-11.5-28.5T760-520H320v280Zm308.5-171.5Q640-423 640-440t-11.5-28.5Q617-480 600-480t-28.5 11.5Q560-457 560-440t11.5 28.5Q583-400 600-400t28.5-11.5Zm120 0Q760-423 760-440t-11.5-28.5Q737-480 720-480t-28.5 11.5Q680-457 680-440t11.5 28.5Q703-400 720-400t28.5-11.5Zm-120 120Q640-303 640-320t-11.5-28.5Q617-360 600-360t-28.5 11.5Q560-337 560-320t11.5 28.5Q583-280 600-280t28.5-11.5Zm120 0Q760-303 760-320t-11.5-28.5Q737-360 720-360t-28.5 11.5Q680-337 680-320t11.5 28.5Q703-280 720-280t28.5-11.5ZM400-280h80q17 0 28.5-11.5T520-320v-120q0-17-11.5-28.5T480-480h-80q-17 0-28.5 11.5T360-440v120q0 17 11.5 28.5T400-280Zm-80 40v-280 280Z"/></svg>`, // fax
  "📧": `<svg ${SVG_ATTRS}><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm640-480L501-453q-5 3-10.5 4.5T480-447q-5 0-10.5-1.5T459-453L160-640v400h640v-400ZM480-520l320-200H160l320 200ZM160-640v10-59 1-32 32-.5 58.5-10 400-400Z"/></svg>`, // mail
  "🌐": `<svg ${SVG_ATTRS}><path d="M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480.5-880t155 31.5q72.5 31.5 127 86t86 127Q880-563 880-480.5T848.5-325q-31.5 73-86 127.5t-127 86Q563-80 480.5-80T325-111.5ZM480-162q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg>`, // language
  "🎫": `<svg ${SVG_ATTRS}><path d="M160-160q-33 0-56.5-23.5T80-240v-135q0-11 7-19t18-10q24-8 39.5-29t15.5-47q0-26-15.5-47T105-556q-11-2-18-10t-7-19v-135q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v135q0 11-7 19t-18 10q-24 8-39.5 29T800-480q0 26 15.5 47t39.5 29q11 2 18 10t7 19v135q0 33-23.5 56.5T800-160H160Zm0-80h640v-102q-37-22-58.5-58.5T720-480q0-43 21.5-79.5T800-618v-102H160v102q37 22 58.5 58.5T240-480q0 43-21.5 79.5T160-342v102Zm320-40q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm0-160q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440Zm0-160q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 120Z"/></svg>`, // confirmation_number
  "🚌": `<svg ${SVG_ATTRS}><path d="M320-200v20q0 25-17.5 42.5T260-120q-25 0-42.5-17.5T200-180v-62q-18-20-29-44.5T160-340v-380q0-83 77-121.5T480-880q172 0 246 37t74 123v380q0 29-11 53.5T760-242v62q0 25-17.5 42.5T700-120q-25 0-42.5-17.5T640-180v-20H320Zm162-560h224-448 224Zm158 280H240h480-80Zm-400-80h480v-120H240v120Zm142.5 222.5Q400-355 400-380t-17.5-42.5Q365-440 340-440t-42.5 17.5Q280-405 280-380t17.5 42.5Q315-320 340-320t42.5-17.5Zm280 0Q680-355 680-380t-17.5-42.5Q645-440 620-440t-42.5 17.5Q560-405 560-380t17.5 42.5Q595-320 620-320t42.5-17.5ZM258-760h448q-15-17-64.5-28.5T482-800q-107 0-156.5 12.5T258-760Zm62 480h320q33 0 56.5-23.5T720-360v-120H240v120q0 33 23.5 56.5T320-280Z"/></svg>`, // directions_bus
  "🏔️": `<svg ${SVG_ATTRS}><path d="M120-240q-25 0-36-22t4-42l160-213q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l148 197h300L560-586l-68 90q-12 16-28 16.5t-28-8.5q-12-9-16-24.5t8-31.5l100-133q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l280 373q15 20 4 42t-36 22H120Zm340-80h300-312 68.5H460Zm-260 0h160l-80-107-80 107Zm0 0h160-160Z"/></svg>`, // landscape
  "🍝": `<svg ${SVG_ATTRS}><path d="M185-120q-12 0-23.5-5T142-138l-28-28q-10-10-5-22t19-12h704q14 0 19 12t-5 22l-28 28q-8 8-19.5 13t-23.5 5H185Zm-65-120q6-18 16-34t24-30v-296h-10q-13 0-21.5-8.5T120-630q0-13 8.5-21.5T150-660h10v-30h-10q-13 0-21.5-8.5T120-720q0-13 8.5-21.5T150-750h10v-30h-10q-13 0-21.5-8.5T120-810q0-13 8.5-21.5T150-840h250q33 0 56.5 23.5T480-760v10h330q13 0 21.5 8.5T840-720q0 13-8.5 21.5T810-690H480v10q0 33-23.5 56.5T400-600h-80v244q14 2 28 6t26 12q26-65 83-103.5T583-480q90 0 153.5 61.5T800-268v28H120Zm334-80h252q-17-36-50-58t-73-22q-42 0-77 21t-52 59ZM320-750h80v-30h-80v30Zm0 90h80v-30h-80v30Zm-100-90h40v-30h-40v30Zm0 90h40v-30h-40v30Zm0 314q10-5 19.5-7.5T260-358v-242h-40v254Zm360 26Z"/></svg>`, // dinner_dining
};

const EDIT_ICONS = {
  up: `<svg ${SVG_ATTRS}><path d="M480-528 324-372q-11 11-28 11t-28-11q-11-11-11-28t11-28l184-184q12-12 28-12t28 12l184 184q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-528Z"/></svg>`, // keyboard_arrow_up
  down: `<svg ${SVG_ATTRS}><path d="M465-363.5q-7-2.5-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5q-8 0-15-2.5Z"/></svg>`, // keyboard_arrow_down
  edit: `<svg ${SVG_ATTRS}><path d="M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`, // edit
  trash: `<svg ${SVG_ATTRS}><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM428.5-291.5Q440-303 440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280q17 0 28.5-11.5Zm160 0Q600-303 600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280q17 0 28.5-11.5ZM280-720v520-520Z"/></svg>`, // delete
  plus: `<svg ${SVG_ATTRS}><path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"/></svg>`, // add
};

// フォームのアイコン選択肢（絵文字キー → 日本語ラベル）
const ICON_LABELS = {
  "🛬": "飛行機（到着）",
  "🛫": "飛行機（出発）",
  "🚗": "車",
  "🥢": "食事（和食）",
  "🍽️": "ディナー",
  "🍳": "朝食",
  "☕": "カフェ",
  "🍰": "スイーツ",
  "🍷": "お酒・ビュッフェ",
  "⛩️": "神社",
  "🏯": "城",
  "🕊️": "平和・祈り",
  "⚓": "港・船の見どころ",
  "🚢": "フェリー",
  "🚡": "ロープウェー",
  "🏨": "ホテル",
  "🅿️": "駐車場",
  "⛽": "給油",
  "🧳": "荷物",
  "🛍️": "買い物",
  "🌙": "夜のおでかけ",
};

function iconFor(emoji) {
  const key = (emoji || "").trim();
  return FLAT_ICONS[key] || FLAT_ICONS[key.replace(/️/g, "")] || key;
}

// ---- 日付ユーティリティ ----
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function parseDate(str) {
  if (!str) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function dayDiff(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}

function formatDate(d) {
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

function timeToMinutes(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((t || "").trim());
  return m ? +m[1] * 60 + +m[2] : null;
}

// ============================================================
// データ層: Firestore（設定済みなら）/ itinerary.json（フォールバック）
// ============================================================

let data = null;          // 旅程データ本体
let db = null;            // Firestore（未設定なら null）
let tripDocRef = null;
let fs = null;            // Firestore SDK モジュール
let canEdit = false;

async function fetchJsonFallback() {
  const res = await fetch("data/itinerary.json");
  return res.json();
}

async function initDataLayer(onData) {
  if (firebaseConfig) {
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
      fs = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const app = appMod.initializeApp(firebaseConfig);
      db = fs.initializeFirestore(app, {
        localCache: fs.persistentLocalCache(),
      });
      tripDocRef = fs.doc(db, "trip", "main");

      // 初回シード: ドキュメントが無ければ itinerary.json を投入
      const snap = await fs.getDoc(tripDocRef);
      if (!snap.exists()) {
        const seed = await fetchJsonFallback();
        await fs.setDoc(tripDocRef, seed);
      }

      canEdit = true;
      fs.onSnapshot(tripDocRef, (s) => {
        if (s.exists()) onData(s.data());
      });
      return;
    } catch (err) {
      console.error("Firestore初期化に失敗。JSONフォールバックで表示します:", err);
    }
  }
  onData(await fetchJsonFallback());
}

async function saveTrip() {
  if (!canEdit || !tripDocRef) return;
  await fs.setDoc(tripDocRef, data);
}

// アップロード画像（fs:<id>）の解決キャッシュ
const imageCache = new Map();

async function resolveImage(imgEl, src) {
  if (!src.startsWith("fs:")) {
    imgEl.src = src;
    return;
  }
  const id = src.slice(3);
  // データURLはネットワークコストがないため lazy を外す
  // （detached要素にlazy+data URLを設定すると読み込まれないブラウザ挙動への対策も兼ねる）
  imgEl.loading = "eager";
  if (imageCache.has(id)) {
    imgEl.src = imageCache.get(id);
    return;
  }
  if (!db) { imgEl.closest(".timeline-photo")?.remove(); return; }
  try {
    const snap = await fs.getDoc(fs.doc(db, "images", id));
    if (snap.exists()) {
      imageCache.set(id, snap.data().data);
      imgEl.src = snap.data().data;
    } else {
      imgEl.closest(".timeline-photo")?.remove();
    }
  } catch {
    imgEl.closest(".timeline-photo")?.remove();
  }
}

// 画像を縮小してdata URLへ（長辺800px・目安150KB以下）
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("読み込み失敗"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("画像を解釈できません"));
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality = 0.75;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        // Firestoreの1MB制限に対して余裕を持たせる（base64で約900KB上限）
        while (dataUrl.length > 900 * 1024 && quality > 0.3) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImage(dataUrl) {
  const ref = await fs.addDoc(fs.collection(db, "images"), {
    data: dataUrl,
    createdAt: Date.now(),
  });
  return `fs:${ref.id}`;
}

// ============================================================
// メイン
// ============================================================

const startOfToday = new Date();
let startDate = null;
let tripDayIndex = null;
let currentDayIndex = 0;
let editMode = false;

// ---- 地図 ----
const map = L.map("map", { scrollWheelZoom: true });
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
map.setView([34.34, 132.45], 10);

const markerLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup().addTo(map);

function makePin(number) {
  return L.divIcon({
    className: "pin-marker",
    html: `<div class="pin-inner"><span>${number}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

// ---- モバイル用ボトムシート ----
const mapPane = document.getElementById("map-pane");
const mapToggle = document.getElementById("map-toggle");
const mapClose = document.getElementById("map-close");
const isMobile = () => window.matchMedia("(max-width: 880px)").matches;

function openMapSheet() {
  mapPane.classList.add("open");
  mapToggle.setAttribute("aria-expanded", "true");
  setTimeout(() => map.invalidateSize(), 350);
}
function closeMapSheet() {
  mapPane.classList.remove("open");
  mapToggle.setAttribute("aria-expanded", "false");
}
mapToggle.addEventListener("click", () =>
  mapPane.classList.contains("open") ? closeMapSheet() : openMapSheet()
);
mapClose.addEventListener("click", () => {
  if (picking) cancelPick();
  closeMapSheet();
});

// ---- DOM参照 ----
const tabsEl = document.getElementById("day-tabs");
const themeEl = document.getElementById("day-theme");
const timelineEl = document.getElementById("timeline");
const countdownEl = document.getElementById("hero-countdown");
const editToggle = document.getElementById("edit-toggle");
const editToggleLabel = document.getElementById("edit-toggle-label");

function selectItem(li) {
  document
    .querySelectorAll(".timeline-item.selected")
    .forEach((el) => el.classList.remove("selected"));
  if (li) li.classList.add("selected");
}

// ---- ヘッダー・カウントダウン ----
function renderHeader() {
  document.getElementById("site-title").textContent = data.title;
  document.getElementById("site-subtitle").textContent = data.subtitle;
  document.title = `${data.title} ${data.subtitle}`;

  startDate = parseDate(data.startDate);
  tripDayIndex = startDate ? dayDiff(startDate, startOfToday) : null;

  countdownEl.hidden = true;
  if (startDate) {
    const diff = dayDiff(startOfToday, startDate);
    if (diff > 0) {
      countdownEl.textContent = `出発まで あと ${diff} 日`;
      countdownEl.hidden = false;
    } else if (tripDayIndex >= 0 && tripDayIndex < data.days.length) {
      countdownEl.textContent = `旅行 ${tripDayIndex + 1} 日目！`;
      countdownEl.hidden = false;
    }
  }
}

// ---- 日タブ ----
function renderTabs() {
  tabsEl.innerHTML = "";
  data.days.forEach((day, i) => {
    const btn = document.createElement("button");
    btn.className = "day-tab" + (i === currentDayIndex ? " active" : "");
    let label = day.label;
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      label += `<small>${formatDate(d)}</small>`;
    }
    btn.innerHTML = label;
    btn.setAttribute("aria-pressed", i === currentDayIndex ? "true" : "false");
    btn.addEventListener("click", () => {
      currentDayIndex = i;
      renderTabs();
      renderDay();
    });
    tabsEl.appendChild(btn);
  });
}

// ---- 編集コントロール生成 ----
function makeEditControls(dayIdx, evIdx, total) {
  const wrap = document.createElement("div");
  wrap.className = "edit-controls";
  wrap.innerHTML = `
    <button type="button" class="ec-btn" data-act="up" title="上へ" ${evIdx === 0 ? "disabled" : ""}>${EDIT_ICONS.up}</button>
    <button type="button" class="ec-btn" data-act="down" title="下へ" ${evIdx === total - 1 ? "disabled" : ""}>${EDIT_ICONS.down}</button>
    <button type="button" class="ec-btn" data-act="edit" title="編集">${EDIT_ICONS.edit}</button>
    <button type="button" class="ec-btn danger" data-act="del" title="削除">${EDIT_ICONS.trash}</button>`;
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".ec-btn");
    if (!btn) return;
    e.stopPropagation();
    const act = btn.dataset.act;
    if (act === "up") moveEvent(dayIdx, evIdx, -1);
    else if (act === "down") moveEvent(dayIdx, evIdx, 1);
    else if (act === "edit") openEditForm(dayIdx, evIdx);
    else if (act === "del") deleteEvent(dayIdx, evIdx);
  });
  return wrap;
}

function makeAddButton(dayIdx, insertAt) {
  const li = document.createElement("li");
  li.className = "timeline-add";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "add-btn";
  btn.innerHTML = `${EDIT_ICONS.plus} ここに予定を追加`;
  btn.addEventListener("click", () => openEditForm(dayIdx, null, insertAt));
  li.appendChild(btn);
  return li;
}

// ---- 日の描画 ----
function renderDay() {
  const day = data.days[currentDayIndex];
  themeEl.textContent = day.theme;

  timelineEl.innerHTML = "";
  markerLayer.clearLayers();
  routeLayer.clearLayers();

  // 「いまここ」判定
  let nowIdx = -1;
  let nextIdx = -1;
  if (tripDayIndex === currentDayIndex) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    day.events.forEach((ev, i) => {
      const t = timeToMinutes(ev.time);
      if (t !== null && t <= nowMin) nowIdx = i;
    });
    if (nowIdx + 1 < day.events.length) nextIdx = nowIdx + 1;
    if (nowIdx === -1) nextIdx = 0;
  }

  let pinCount = 0;
  const routePoints = [];
  let nowLi = null;

  if (editMode) timelineEl.appendChild(makeAddButton(currentDayIndex, 0));

  day.events.forEach((ev, evIdx) => {
    const li = document.createElement("li");
    const hasOptions = Array.isArray(ev.options) && ev.options.length > 0;
    li.className = "timeline-item" + (ev.spot || hasOptions ? " has-spot" : "");
    if (evIdx === nowIdx) { li.classList.add("is-now"); nowLi = li; }

    const metaParts = [];
    if (evIdx === nowIdx) metaParts.push(`<span class="badge-now">いまここ</span>`);
    if (evIdx === nextIdx) metaParts.push(`<span class="badge-next">つぎ</span>`);
    if (ev.badge) metaParts.push(`<span class="badge-note">${ev.badge}</span>`);

    let pinNumber = null;
    if (ev.spot) {
      pinCount += 1;
      pinNumber = pinCount;
      const href = ev.spot.mapUrl || `https://www.google.com/maps?q=${ev.spot.lat},${ev.spot.lng}`;
      metaParts.push(
        `<a class="gmap-link" href="${href}" target="_blank" rel="noopener" title="Googleマップで開く">${iconFor("📍")} ${pinNumber}. ${ev.spot.name} <span class="gmap-ext">↗</span></a>`
      );
    }

    if (hasOptions) {
      ev.options.forEach((opt) => {
        pinCount += 1;
        const num = pinCount;
        const href = opt.mapUrl || `https://www.google.com/maps?q=${opt.lat},${opt.lng}`;
        metaParts.push(
          `<a class="gmap-link" href="${href}" target="_blank" rel="noopener" title="Googleマップで開く">${iconFor("📍")} ${num}. ${opt.name} <span class="gmap-ext">↗</span></a>`
        );
      });
    }

    const photoHtml = ev.image
      ? `<figure class="timeline-photo">
           <img alt="${ev.spot ? ev.spot.name : ev.title}" loading="lazy">
           ${ev.caption ? `<figcaption>${ev.caption}</figcaption>` : ""}
         </figure>`
      : "";

    li.innerHTML = `
      <div class="timeline-time">
        <span class="timeline-time-main">${ev.time}</span>
        ${ev.duration ? `<span class="timeline-duration">${ev.duration}</span>` : ""}
      </div>
      <div class="timeline-dot">${iconFor(ev.icon)}</div>
      <div class="timeline-body">
        <div class="timeline-text">
          <div class="timeline-title">${ev.title}</div>
          ${ev.description ? `<div class="timeline-desc">${ev.description}</div>` : ""}
          ${metaParts.length ? `<div class="timeline-meta">${metaParts.join("")}</div>` : ""}
        </div>
        ${photoHtml}
      </div>`;

    if (editMode) {
      li.classList.add("editable");
      li.prepend(makeEditControls(currentDayIndex, evIdx, day.events.length));
    }

    const img = li.querySelector(".timeline-photo img");
    if (img) {
      img.addEventListener("error", () => img.closest(".timeline-photo")?.remove());
      resolveImage(img, ev.image);
    }

    if (ev.spot) {
      const marker = L.marker([ev.spot.lat, ev.spot.lng], {
        icon: makePin(pinNumber),
      }).addTo(markerLayer);
      marker.bindPopup(
        `<div class="popup-time">${ev.time}</div><div class="popup-name">${ev.spot.name}</div>`
      );
      routePoints.push([ev.spot.lat, ev.spot.lng]);

      li.querySelector(".timeline-text").addEventListener("click", (e) => {
        if (e.target.closest(".gmap-link")) return;
        selectItem(li);
        map.flyTo([ev.spot.lat, ev.spot.lng], 14, { duration: 0.8 });
        marker.openPopup();
        if (isMobile()) openMapSheet();
      });

      marker.on("click", () => {
        if (picking) return;
        selectItem(li);
        if (isMobile()) closeMapSheet();
        li.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    if (hasOptions) {
      const optionPoints = [];
      ev.options.forEach((opt, optIdx) => {
        const num = pinCount - ev.options.length + optIdx + 1;
        const marker = L.marker([opt.lat, opt.lng], { icon: makePin(num) }).addTo(markerLayer);
        marker.bindPopup(
          `<div class="popup-time">${ev.time}</div><div class="popup-name">${opt.name}</div>`
        );
        routePoints.push([opt.lat, opt.lng]);
        optionPoints.push([opt.lat, opt.lng]);

        marker.on("click", () => {
          if (picking) return;
          selectItem(li);
          if (isMobile()) closeMapSheet();
          li.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });

      li.querySelector(".timeline-text").addEventListener("click", (e) => {
        if (e.target.closest(".gmap-link")) return;
        selectItem(li);
        map.flyToBounds(optionPoints, { padding: [60, 60], maxZoom: 15, duration: 0.8 });
        if (isMobile()) openMapSheet();
      });
    }

    timelineEl.appendChild(li);

    if (ev.travelAfter && ev.travelAfter.text && evIdx < day.events.length - 1) {
      const travelLi = document.createElement("li");
      travelLi.className = "timeline-travel";
      travelLi.setAttribute("aria-label", "移動");
      travelLi.innerHTML = `<span class="travel-chip">${iconFor(ev.travelAfter.icon)} ${ev.travelAfter.text}</span>`;
      timelineEl.appendChild(travelLi);
    }

    if (editMode) timelineEl.appendChild(makeAddButton(currentDayIndex, evIdx + 1));
  });

  if (routePoints.length > 1) {
    L.polyline(routePoints, {
      color: "#c8401f",
      weight: 3,
      opacity: 0.7,
      dashArray: "6 9",
      lineCap: "round",
    }).addTo(routeLayer);
  }

  if (routePoints.length > 0 && !picking) {
    map.fitBounds(routePoints, { padding: [46, 46], maxZoom: 13 });
  }

  if (nowLi && !editMode && !renderDay._scrolledToNow) {
    renderDay._scrolledToNow = true;
    setTimeout(() => nowLi.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }
}

// ============================================================
// 編集モード
// ============================================================

editToggle.addEventListener("click", () => {
  editMode = !editMode;
  editToggle.classList.toggle("on", editMode);
  editToggle.setAttribute("aria-pressed", editMode ? "true" : "false");
  editToggleLabel.textContent = editMode ? "編集を終了" : "編集";
  document.body.classList.toggle("editing", editMode);
  if (!editMode) hideUndoToast();
  renderDay();
  if (data) renderLodging();
});

// ---- 並べ替え ----
async function moveEvent(dayIdx, evIdx, delta) {
  const events = data.days[dayIdx].events;
  const to = evIdx + delta;
  if (to < 0 || to >= events.length) return;
  [events[evIdx], events[to]] = [events[to], events[evIdx]];
  renderDay();
  await saveTrip();
}

// ---- 削除＋元に戻す ----
const undoToast = document.getElementById("undo-toast");
const undoMessage = document.getElementById("undo-message");
const undoBtn = document.getElementById("undo-btn");
let undoState = null;
let undoTimer = null;

function hideUndoToast() {
  undoToast.hidden = true;
  undoState = null;
  clearTimeout(undoTimer);
}

async function deleteEvent(dayIdx, evIdx) {
  const events = data.days[dayIdx].events;
  const [removed] = events.splice(evIdx, 1);
  undoState = { type: "event", dayIdx, evIdx, removed };
  undoMessage.textContent = `「${removed.title}」を削除しました`;
  undoToast.hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndoToast, 6000);
  renderDay();
  await saveTrip();
}

undoBtn.addEventListener("click", async () => {
  if (!undoState) return;
  const { dayIdx, evIdx, removed } = undoState;
  data.days[dayIdx].events.splice(Math.min(evIdx, data.days[dayIdx].events.length), 0, removed);
  hideUndoToast();
  renderDay();
  await saveTrip();
});

// ---- 編集フォーム ----
const editSheet = document.getElementById("edit-sheet");
const editForm = document.getElementById("edit-form");
const fTime = document.getElementById("f-time");
const fIcon = document.getElementById("f-icon");
const fTitle = document.getElementById("f-title");
const fDesc = document.getElementById("f-desc");
const fDay = document.getElementById("f-day");
const fBadge = document.getElementById("f-badge");
const fSpotName = document.getElementById("f-spot-name");
const fCoords = document.getElementById("f-coords");
const fPick = document.getElementById("f-pick");
const fNoSpot = document.getElementById("f-no-spot");
const fMapUrl = document.getElementById("f-mapurl");
const fTravelIcon = document.getElementById("f-travel-icon");
const fTravelText = document.getElementById("f-travel-text");
const fPhotoPreview = document.getElementById("f-photo-preview");
const fPhotoFile = document.getElementById("f-photo-file");
const fPhotoUrl = document.getElementById("f-photo-url");
const fPhotoRemove = document.getElementById("f-photo-remove");
const fPhotoStatus = document.getElementById("f-photo-status");
const fPhotoCaption = document.getElementById("f-photo-caption");

// アイコン選択肢を構築
Object.entries(ICON_LABELS).forEach(([emoji, label]) => {
  const opt = document.createElement("option");
  opt.value = emoji;
  opt.textContent = `${emoji} ${label}`;
  fIcon.appendChild(opt);
});

// フォームの一時状態
let formState = null; // { dayIdx, evIdx(null=新規), insertAt, coords, image, pendingUpload, options: [] }
let pickTarget = "spot"; // "spot" | 候補スポットのindex

// シート表示中は背面ページのスクロールを固定する
// （モーダルの内側スクロールが背面に伝わって画面がガタつくのを防ぐ）
let lockScrollY = 0;
function lockBody() {
  lockScrollY = window.scrollY;
  document.body.style.top = `-${lockScrollY}px`;
  document.body.classList.add("sheet-locked");
}
function unlockBody() {
  document.body.classList.remove("sheet-locked");
  document.body.style.top = "";
  window.scrollTo({ top: lockScrollY, behavior: "instant" });
}

function openEditForm(dayIdx, evIdx, insertAt = null) {
  const isNew = evIdx === null;
  const ev = isNew
    ? { time: "12:00", icon: "📍", title: "", description: "", spot: null }
    : data.days[dayIdx].events[evIdx];

  formState = {
    dayIdx,
    evIdx,
    insertAt,
    coords: ev.spot ? { lat: ev.spot.lat, lng: ev.spot.lng } : null,
    image: ev.image || null,
    pendingUpload: null,
    options: Array.isArray(ev.options) ? JSON.parse(JSON.stringify(ev.options)) : [],
  };
  pickTarget = "spot";

  document.getElementById("edit-sheet-title").textContent = isNew ? "予定を追加" : "予定を編集";
  fTime.value = ev.time || "12:00";
  fIcon.value = ICON_LABELS[ev.icon] ? ev.icon : "📍";
  if (!ICON_LABELS[ev.icon] && ev.icon) {
    // データに未知のアイコンがある場合は選択肢に追加して保持
    const opt = document.createElement("option");
    opt.value = ev.icon;
    opt.textContent = ev.icon;
    fIcon.appendChild(opt);
    fIcon.value = ev.icon;
  }
  fTitle.value = ev.title || "";
  fDesc.value = ev.description || "";
  fBadge.value = ev.badge || "";
  fSpotName.value = ev.spot ? ev.spot.name : "";
  fMapUrl.value = ev.spot && ev.spot.mapUrl ? ev.spot.mapUrl : "";
  fNoSpot.checked = !ev.spot;
  fTravelIcon.value = ev.travelAfter ? ev.travelAfter.icon || "" : "";
  fTravelText.value = ev.travelAfter ? ev.travelAfter.text || "" : "";
  fPhotoUrl.value = ev.image && !ev.image.startsWith("fs:") ? ev.image : "";
  fPhotoCaption.value = ev.caption || "";
  fPhotoStatus.textContent = "";
  updateCoordsLabel();
  updatePhotoPreview();
  renderFormOptions();

  // 日の選択肢
  fDay.innerHTML = "";
  data.days.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = d.label;
    fDay.appendChild(opt);
  });
  fDay.value = dayIdx;

  editSheet.hidden = false;
  lockBody();
  editSheet.offsetHeight; // リフローを挟んでtransitionを確実に発火させる
  editSheet.classList.add("open");
}

function closeEditForm() {
  editSheet.classList.remove("open");
  setTimeout(() => { editSheet.hidden = true; }, 300);
  if (picking) cancelPick();
  unlockBody();
  formState = null;
}

document.getElementById("edit-close").addEventListener("click", closeEditForm);
document.getElementById("f-cancel").addEventListener("click", closeEditForm);

function updateCoordsLabel() {
  if (formState && formState.coords) {
    fCoords.textContent = `${formState.coords.lat.toFixed(4)}, ${formState.coords.lng.toFixed(4)}`;
    fCoords.classList.add("set");
  } else {
    fCoords.textContent = "未設定";
    fCoords.classList.remove("set");
  }
}

function updatePhotoPreview() {
  const src = formState ? (formState.pendingUpload || formState.image) : null;
  if (!src) {
    fPhotoPreview.hidden = true;
    fPhotoRemove.hidden = true;
    return;
  }
  fPhotoRemove.hidden = false;
  fPhotoPreview.hidden = false;
  if (src.startsWith("fs:")) {
    fPhotoPreview.removeAttribute("src");
    resolveImage(fPhotoPreview, src);
  } else {
    fPhotoPreview.src = src;
  }
}

// 写真: ファイル選択 → 縮小
fPhotoFile.addEventListener("change", async () => {
  const file = fPhotoFile.files[0];
  if (!file || !formState) return;
  fPhotoStatus.textContent = "画像を縮小しています…";
  try {
    formState.pendingUpload = await compressImage(file);
    fPhotoUrl.value = "";
    fPhotoStatus.textContent = `準備OK（約${Math.round(formState.pendingUpload.length / 1024)}KB）— 保存時にアップロードされます`;
    updatePhotoPreview();
  } catch (err) {
    fPhotoStatus.textContent = "画像を読み込めませんでした";
  }
  fPhotoFile.value = "";
});

fPhotoUrl.addEventListener("input", () => {
  if (!formState) return;
  formState.pendingUpload = null;
  formState.image = fPhotoUrl.value.trim() || null;
  updatePhotoPreview();
});

fPhotoRemove.addEventListener("click", () => {
  if (!formState) return;
  formState.pendingUpload = null;
  formState.image = null;
  fPhotoUrl.value = "";
  fPhotoStatus.textContent = "";
  updatePhotoPreview();
});

// ---- 候補スポットの編集UI ----
const fOptions = document.getElementById("f-options");

function renderFormOptions() {
  fOptions.innerHTML = "";
  if (!formState) return;
  formState.options.forEach((opt, i) => {
    const row = document.createElement("div");
    row.className = "option-edit";
    row.innerHTML = `
      <div class="form-grid two">
        <label class="form-field">店名
          <input type="text" class="fo-name" maxlength="60" placeholder="店名">
        </label>
        <label class="form-field">ジャンル
          <input type="text" class="fo-genre" maxlength="30" placeholder="イタリアン など">
        </label>
      </div>
      <label class="form-field">Googleマップリンク（共有リンク）
        <input type="url" class="fo-mapurl" placeholder="https://maps.app.goo.gl/…">
      </label>
      <div class="form-pick-row">
        <span class="form-coords fo-coords"></span>
        <button type="button" class="form-btn fo-pick">
          ${iconFor("📍")} 地図でピン指定
        </button>
        <button type="button" class="form-btn danger fo-remove">削除</button>
      </div>`;

    const nameEl = row.querySelector(".fo-name");
    const genreEl = row.querySelector(".fo-genre");
    const mapUrlEl = row.querySelector(".fo-mapurl");
    const coordsEl = row.querySelector(".fo-coords");

    nameEl.value = opt.name || "";
    genreEl.value = opt.genre || "";
    mapUrlEl.value = opt.mapUrl || "";
    if (opt.lat != null && opt.lng != null) {
      coordsEl.textContent = `${(+opt.lat).toFixed(4)}, ${(+opt.lng).toFixed(4)}`;
      coordsEl.classList.add("set");
    } else {
      coordsEl.textContent = "未設定";
    }

    nameEl.addEventListener("input", () => { opt.name = nameEl.value; });
    genreEl.addEventListener("input", () => { opt.genre = genreEl.value; });
    mapUrlEl.addEventListener("input", () => { opt.mapUrl = mapUrlEl.value.trim(); });

    row.querySelector(".fo-pick").addEventListener("click", () => startPick(i, opt));
    row.querySelector(".fo-remove").addEventListener("click", () => {
      formState.options.splice(i, 1);
      renderFormOptions();
    });

    fOptions.appendChild(row);
  });
}

document.getElementById("f-option-add").addEventListener("click", () => {
  if (!formState) return;
  formState.options.push({ name: "", genre: "", mapUrl: "" });
  renderFormOptions();
});

// ---- 地図でピン指定（メイン場所・候補スポット共用） ----
let picking = false;
const pickBanner = document.getElementById("map-pick-banner");

function startPick(target, existing) {
  if (!formState) return;
  pickTarget = target;
  picking = true;
  pickBanner.hidden = false;
  editSheet.classList.add("picking"); // シートを一時的に引っ込める
  if (isMobile()) openMapSheet();
  const cur = target === "spot" ? formState.coords : existing;
  if (cur && cur.lat != null) map.flyTo([cur.lat, cur.lng], 14);
}

fPick.addEventListener("click", () => {
  fNoSpot.checked = false;
  startPick("spot", formState ? formState.coords : null);
});

function cancelPick() {
  picking = false;
  pickBanner.hidden = true;
  editSheet.classList.remove("picking");
}

map.on("click", (e) => {
  if (!picking || !formState) return;
  const lat = Math.round(e.latlng.lat * 10000) / 10000;
  const lng = Math.round(e.latlng.lng * 10000) / 10000;
  if (pickTarget === "spot") {
    formState.coords = { lat, lng };
    updateCoordsLabel();
  } else if (formState.options[pickTarget]) {
    formState.options[pickTarget].lat = lat;
    formState.options[pickTarget].lng = lng;
    renderFormOptions();
  }
  cancelPick();
  if (isMobile()) closeMapSheet();
});

// ---- 保存 ----
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!formState) return;
  const saveBtn = document.getElementById("f-save");
  saveBtn.disabled = true;

  try {
    // 画像アップロード（保留分があれば）
    let image = formState.image;
    if (formState.pendingUpload) {
      fPhotoStatus.textContent = "写真をアップロード中…";
      image = await uploadImage(formState.pendingUpload);
    }

    const { dayIdx, evIdx, insertAt } = formState;
    const original = evIdx !== null ? data.days[dayIdx].events[evIdx] : {};

    const ev = { ...original };
    ev.time = fTime.value;
    ev.icon = fIcon.value;
    ev.title = fTitle.value.trim();
    ev.description = fDesc.value.trim();

    if (fBadge.value.trim()) ev.badge = fBadge.value.trim();
    else delete ev.badge;

    if (!fNoSpot.checked && formState.coords && fSpotName.value.trim()) {
      ev.spot = {
        name: fSpotName.value.trim(),
        lat: formState.coords.lat,
        lng: formState.coords.lng,
      };
      if (fMapUrl.value.trim()) ev.spot.mapUrl = fMapUrl.value.trim();
    } else {
      ev.spot = null;
    }

    if (fTravelText.value.trim()) {
      ev.travelAfter = { icon: fTravelIcon.value || "🚗", text: fTravelText.value.trim() };
    } else {
      delete ev.travelAfter;
    }

    // 候補スポット: 店名入りのみ採用。位置未設定はエラーで保存中断
    const validOptions = formState.options.filter((o) => (o.name || "").trim());
    const noCoords = validOptions.find((o) => o.lat == null || o.lng == null);
    if (noCoords) {
      fPhotoStatus.textContent = `候補「${noCoords.name}」の位置が未設定です。「地図でピン指定」でピンを打ってください。`;
      saveBtn.disabled = false;
      return;
    }
    if (validOptions.length > 0) {
      ev.options = validOptions.map((o) => {
        const out = { name: o.name.trim(), genre: (o.genre || "").trim(), lat: o.lat, lng: o.lng };
        if ((o.mapUrl || "").trim()) out.mapUrl = o.mapUrl.trim();
        return out;
      });
    } else {
      delete ev.options;
    }

    if (image) {
      ev.image = image;
      if (fPhotoCaption.value.trim()) ev.caption = fPhotoCaption.value.trim();
      else delete ev.caption;
    } else {
      delete ev.image;
      delete ev.caption;
    }

    const targetDay = +fDay.value;

    if (evIdx === null) {
      // 新規: 指定位置（または時刻順）に挿入
      const events = data.days[targetDay].events;
      if (targetDay === dayIdx && insertAt !== null) {
        events.splice(insertAt, 0, ev);
      } else {
        insertByTime(events, ev);
      }
    } else if (targetDay === dayIdx) {
      data.days[dayIdx].events[evIdx] = ev;
    } else {
      // 日またぎ移動: 元の日から外し、移動先へ時刻順で挿入
      data.days[dayIdx].events.splice(evIdx, 1);
      insertByTime(data.days[targetDay].events, ev);
      currentDayIndex = targetDay;
    }

    closeEditForm();
    renderTabs();
    renderDay();
    await saveTrip();
  } catch (err) {
    console.error("保存に失敗:", err);
    fPhotoStatus.textContent = "保存に失敗しました。通信環境を確認してもう一度お試しください。";
  } finally {
    saveBtn.disabled = false;
  }
});

function insertByTime(events, ev) {
  const t = timeToMinutes(ev.time) ?? 0;
  let at = events.length;
  for (let i = 0; i < events.length; i++) {
    const ti = timeToMinutes(events[i].time);
    if (ti !== null && ti > t) { at = i; break; }
  }
  events.splice(at, 0, ev);
}

// ============================================================
// お土産: 紹介カタログ ＋ 買い物リスト（端末ごとのlocalStorage保存）
// ============================================================

const SOUVENIRS = [
  {
    name: "もみじ饅頭",
    desc: "広島みやげの王様。定番のこしあんのほか、チーズ・チョコ・揚げもみじも人気。",
    place: "表参道商店街・広島空港",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Momiji_manju_of_Yamadaya_variants.jpg/500px-Momiji_manju_of_Yamadaya_variants.jpg",
  },
  {
    name: "牡蠣の加工品",
    desc: "牡蠣のオイル漬け・燻製・佃煮など。日持ちするのでお土産向き。お酒好きに喜ばれる。",
    place: "宮島・広島空港",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Grilled_oysters_Food_in_Miyajima_-_DSC02189.JPG/500px-Grilled_oysters_Food_in_Miyajima_-_DSC02189.JPG",
  },
  {
    name: "瀬戸内レモンのお菓子",
    desc: "レモンケーキやはっさくゼリーなど、瀬戸内の柑橘を使った爽やかな銘菓たち。",
    place: "広島駅・広島空港",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Lemon_cake_-_Hello_My_Moon_2024-04-07.jpg/500px-Lemon_cake_-_Hello_My_Moon_2024-04-07.jpg",
  },
  {
    name: "桐葉菓（やまだ屋）",
    desc: "小豆あんを求肥入りの生地で包んで焼き上げた銘菓。緑茶によく合う上品な甘さ。",
    place: "広島市内・宮島・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_02.jpg",
  },
  {
    name: "生もみじ（にしき堂）",
    desc: "もみじ饅頭を生菓子仕立てにした人気商品。県産の餅粉と米粉を使ったもちもち食感。",
    place: "広島市内・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_03.jpg",
  },
  {
    name: "川通り餅（亀屋）",
    desc: "求肥にきな粉をまぶしくるみを加えた素朴な味わいの生菓子。江戸時代から続く銘菓。",
    place: "広島市内",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_04.jpg",
  },
  {
    name: "元祖はっさく大福（かしはら）",
    desc: "みかん練り込みの餅で、まるごとのはっさくと白あんを包んだ人気大福。季節限定販売。",
    place: "尾道",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_05.jpg",
  },
  {
    name: "からす麦の焼きたてクッキー（バッケンモーツアルト）",
    desc: "からす麦・アーモンド・和三盆を使い、モンドセレクション最高金賞を受賞したクッキー。",
    place: "広島市内・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_06.jpg",
  },
  {
    name: "レモスコ（ヤマトフーズ）",
    desc: "瀬戸内レモンの果汁・皮と青唐辛子を合わせた万能調味料。揚げ物やパスタにも。",
    place: "広島空港・道の駅",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_07.jpg",
  },
  {
    name: "ゆかり（三島食品）",
    desc: "赤しそを使った混ぜご飯の素のロングセラー商品。軽くて配りやすいお土産の定番。",
    place: "スーパー・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_08.jpg",
  },
  {
    name: "花瑠＆花星（倉崎海産）",
    desc: "広島湾産の焼き牡蠣を醤油漬けにした逸品。ご飯のお供にもお酒のあてにも。",
    place: "宮島・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_09.jpg",
  },
  {
    name: "広島の地酒（賀茂鶴・蓬莱鶴など）",
    desc: "酒どころ西条をはじめとする広島の地酒。香り豊かでバランスの良い大吟醸が揃う。",
    place: "西条・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_10.jpg",
  },
  {
    name: "くりーむパン（八天堂）",
    desc: "冷やして食べる新食感のクリームパン。純正クリームを使った上品な甘さが人気。",
    place: "広島空港・広島駅",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_14.jpg",
  },
  {
    name: "瀬戸田レモンケーキ（島ごころ）",
    desc: "瀬戸田産レモンを使った看板商品。累計販売300万個を突破したしまなみ土産の定番。",
    place: "瀬戸田・広島空港",
    image: "https://image.dive-hiroshima.com/wp-content/uploads/2022/01/souvenir_img_15.jpg",
  },
];

const SHOPPING_KEY = "hiroshima-shopping-v1";

function loadShopping() {
  try {
    return JSON.parse(localStorage.getItem(SHOPPING_KEY)) || { checked: {}, items: [] };
  } catch {
    return { checked: {}, items: [] };
  }
}
function saveShopping(state) {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(state));
}

const shoppingState = loadShopping();
const souvenirGrid = document.getElementById("souvenir-grid");
const shoppingListEl = document.getElementById("shopping-list");
const shoppingEmpty = document.getElementById("shopping-empty");
const shoppingForm = document.getElementById("shopping-form");
const shoppingInput = document.getElementById("shopping-input");

function addShoppingItem(name) {
  if (!name || shoppingState.items.includes(name)) return;
  shoppingState.items.push(name);
  saveShopping(shoppingState);
  renderShopping();
  renderSouvenirCatalog();
}

function renderSouvenirCatalog() {
  souvenirGrid.innerHTML = "";
  SOUVENIRS.forEach((s) => {
    const inList = shoppingState.items.includes(s.name);
    const card = document.createElement("div");
    card.className = "souvenir-card";
    card.innerHTML = `
      <img src="${s.image}" alt="${s.name}" loading="lazy">
      <div class="souvenir-body">
        <div class="souvenir-name">${s.name}</div>
        <p class="souvenir-desc">${s.desc}</p>
        <span class="souvenir-place">${iconFor("📍")} ${s.place}</span>
        <button type="button" class="souvenir-add" ${inList ? "disabled" : ""}>
          ${inList ? "追加済み ✓" : "＋ リストに追加"}
        </button>
      </div>`;
    card.querySelector("img").addEventListener("error", (e) => e.target.remove());
    card.querySelector(".souvenir-add").addEventListener("click", () => addShoppingItem(s.name));
    souvenirGrid.appendChild(card);
  });
}

function renderShopping() {
  shoppingListEl.innerHTML = "";
  shoppingEmpty.hidden = shoppingState.items.length > 0;

  shoppingState.items.forEach((name, i) => {
    const checked = !!shoppingState.checked[name];
    const li = document.createElement("li");
    li.className = "packing-item" + (checked ? " checked" : "");
    const id = `shop-${i}`;
    li.innerHTML = `
      <input type="checkbox" id="${id}" ${checked ? "checked" : ""}>
      <label for="${id}"></label>
      <button type="button" class="packing-remove" aria-label="削除">${iconFor("✕")}</button>`;
    li.querySelector("label").textContent = name;

    li.querySelector("input").addEventListener("change", (e) => {
      shoppingState.checked[name] = e.target.checked;
      saveShopping(shoppingState);
      li.classList.toggle("checked", e.target.checked);
    });

    li.querySelector(".packing-remove").addEventListener("click", () => {
      shoppingState.items = shoppingState.items.filter((n) => n !== name);
      delete shoppingState.checked[name];
      saveShopping(shoppingState);
      renderShopping();
      renderSouvenirCatalog();
    });

    shoppingListEl.appendChild(li);
  });
}

shoppingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addShoppingItem(shoppingInput.value.trim());
  shoppingInput.value = "";
});

renderSouvenirCatalog();
renderShopping();

// ============================================================
// お役立ち情報: 宿泊 / 緊急連絡先 / 運行状況リンク
// （宿泊情報の部屋番号・Wi-FiのみFirebase連携で編集可。それ以外は静的データで
//   値の追記や修正はこのファイルを直接編集）
// ============================================================

// data.lodging が未設定（初回シード前のFirestoreドキュメントなど）の場合のフォールバック
const DEFAULT_LODGING = [
  {
    day: "1日目〜2日目",
    name: "ホテル宮島別荘",
    address: "〒739-0505 広島県廿日市市宮島町1165",
    phone: "0829-44-1180",
    roomNumber: "TBD（未入力）",
    checkIn: "14:45",
    checkOut: "10:00",
    wifi: { ssid: "TBD（未入力）", password: "TBD（未入力）" },
    notes: "表参道商店街まで徒歩圏。ディナービュッフェは館内。",
    spot: { name: "ホテル宮島別荘", lat: 34.3020, lng: 132.3225 },
    image: "https://images.trvl-media.com/lodging/7000000/6140000/6133900/6133886/71d782f3.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
  },
  {
    day: "2日目〜3日目",
    name: "ヒルトン広島",
    address: "〒730-0043 広島県広島市中区富士見町11-12",
    phone: "082-243-2700",
    roomNumber: "TBD（未入力）",
    checkIn: "19:20",
    checkOut: "10:00",
    wifi: { ssid: "TBD（未入力）", password: "TBD（未入力）" },
    notes: "レンタカーはホテル駐車場を利用。",
    spot: { name: "ヒルトン広島", lat: 34.3866, lng: 132.4682 },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyCESvppgoNJ3UzYNMXAfXtqJYEgQIXpKOC1uTpjcLzA&s=10",
  },
];

const PARKING_INFO = [
  {
    name: "羽田空港民間駐車場　エイトパーキング",
    receiptNumber: "92458",
    address: "〒210-0862 川崎市川崎区浮島町11-3",
    tel: "044-270-4189",
    fax: "044-270-3789",
    email: "info@8parking.com",
    url: "http://www.8parking.com/",
  },
];

const EMERGENCY_CONTACTS = [
  { category: "レンタカー会社", name: "トヨタレンタカー広島空港", phone: "0800-7000-111", hours: "貸出 10:00 ／ 返却 19:00", note: "事故・故障時のロードサービス番号" },
];

const TRANSIT_LINKS = [
  { icon: "🛫", label: "ANA運航状況（羽田⇄広島）", url: "https://www.ana.co.jp/other/dom/status/index.html", note: "ANA便名を入力して検索" },
  { icon: "🚢", label: "JR西日本宮島フェリー 運航情報", url: "https://www.jr-miyajimaferry.co.jp/", note: "強風・高潮時の運休情報" },
  { icon: "🚢", label: "宮島松大汽船 運航情報", url: "https://www.miyajima-matsudai.co.jp/", note: "" },
];

const ANA_NOTICES = [
  {
    icon: "🔋",
    title: "モバイルバッテリーは必ず機内持込手荷物へ",
    body: "モバイルバッテリー・予備電池はリチウムイオン電池のため受託手荷物（預け入れ荷物）には入れられません。スーツケースを預ける前に必ず取り出し、機内に持ち込んでください。",
  },
];

function fieldOrTbd(value) {
  return value && !value.startsWith("TBD")
    ? value
    : `<span class="tbd-badge">未入力</span>`;
}

function renderLodging() {
  const el = document.getElementById("lodging-list");
  el.innerHTML = "";
  (data.lodging || []).forEach((lo, idx) => {
    const card = document.createElement("div");
    card.className = "lodging-card";
    card.innerHTML = `
      ${lo.image ? `<img src="${lo.image}" alt="${lo.name}" loading="lazy">` : ""}
      <div class="lodging-body">
        <div class="lodging-head">
          <span class="lodging-day">${lo.day}</span>
          <h4 class="lodging-name">${lo.name}</h4>
          ${editMode ? `<button type="button" class="ec-btn lodging-edit-btn" title="編集">${EDIT_ICONS.edit}</button>` : ""}
        </div>
        <dl class="lodging-fields">
          <dt>${iconFor("📍")} 住所</dt><dd>${fieldOrTbd(lo.address)}</dd>
          <dt>${iconFor("📞")} 電話</dt><dd>${lo.phone && !lo.phone.startsWith("TBD") ? `<a class="tel-link" href="tel:${lo.phone.replace(/[^\d]/g, "")}">${lo.phone}</a>` : fieldOrTbd(lo.phone)}</dd>
          <dt>部屋番号</dt><dd>${fieldOrTbd(lo.roomNumber)}</dd>
          <dt>チェックイン</dt><dd>${fieldOrTbd(lo.checkIn)}</dd>
          <dt>チェックアウト</dt><dd>${fieldOrTbd(lo.checkOut)}</dd>
          <dt>${iconFor("📶")} Wi-Fi</dt><dd>${fieldOrTbd(lo.wifi.ssid)} / ${fieldOrTbd(lo.wifi.password)}</dd>
        </dl>
        ${lo.notes ? `<p class="lodging-notes">${lo.notes}</p>` : ""}
        <a class="gmap-link" href="${lo.spot.mapUrl || `https://www.google.com/maps?q=${lo.spot.lat},${lo.spot.lng}`}" target="_blank" rel="noopener">${iconFor("📍")} 地図で開く</a>
      </div>`;
    const img = card.querySelector("img");
    if (img) img.addEventListener("error", (e) => e.target.remove());
    const editBtn = card.querySelector(".lodging-edit-btn");
    if (editBtn) editBtn.addEventListener("click", () => openLodgingEditForm(idx));
    el.appendChild(card);
  });
}

// ---- 宿泊情報の編集フォーム（部屋番号・Wi-Fiのみ。当日にならないと分からない項目） ----
const lodgingEditSheet = document.getElementById("lodging-edit-sheet");
const lodgingEditForm = document.getElementById("lodging-edit-form");
const lfRoom = document.getElementById("lf-room");
const lfWifiSsid = document.getElementById("lf-wifi-ssid");
const lfWifiPass = document.getElementById("lf-wifi-pass");
let lodgingEditIdx = null;

function openLodgingEditForm(idx) {
  const lo = data.lodging[idx];
  lodgingEditIdx = idx;
  document.getElementById("lodging-edit-title").textContent = `${lo.name} を編集`;
  lfRoom.value = lo.roomNumber && !lo.roomNumber.startsWith("TBD") ? lo.roomNumber : "";
  lfWifiSsid.value = lo.wifi.ssid && !lo.wifi.ssid.startsWith("TBD") ? lo.wifi.ssid : "";
  lfWifiPass.value = lo.wifi.password && !lo.wifi.password.startsWith("TBD") ? lo.wifi.password : "";
  lodgingEditSheet.hidden = false;
  lockBody();
  lodgingEditSheet.offsetHeight;
  lodgingEditSheet.classList.add("open");
}

function closeLodgingEditForm() {
  lodgingEditSheet.classList.remove("open");
  setTimeout(() => { lodgingEditSheet.hidden = true; }, 300);
  unlockBody();
  lodgingEditIdx = null;
}

lodgingEditForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (lodgingEditIdx === null) return;
  const lo = data.lodging[lodgingEditIdx];
  lo.roomNumber = lfRoom.value.trim() || "TBD（未入力）";
  lo.wifi.ssid = lfWifiSsid.value.trim() || "TBD（未入力）";
  lo.wifi.password = lfWifiPass.value.trim() || "TBD（未入力）";
  closeLodgingEditForm();
  renderLodging();
  await saveTrip();
});

document.getElementById("lodging-edit-close").addEventListener("click", closeLodgingEditForm);
document.getElementById("lf-cancel").addEventListener("click", closeLodgingEditForm);

function renderParkingInfo() {
  const el = document.getElementById("parking-list");
  el.innerHTML = "";
  PARKING_INFO.forEach((p) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.innerHTML = `
      <div class="contact-category">駐車場</div>
      <div class="contact-name">${p.name}</div>
      ${p.receiptNumber ? `<p class="contact-hours">受付番号：${p.receiptNumber}</p>` : ""}
      <dl class="lodging-fields">
        <dt>${iconFor("📍")} 住所</dt><dd>${p.address}</dd>
        <dt>${iconFor("📞")} 電話</dt><dd><a class="tel-link" href="tel:${p.tel.replace(/[^\d]/g, "")}">${p.tel}</a></dd>
        <dt>${iconFor("📠")} FAX</dt><dd>${p.fax}</dd>
        <dt>${iconFor("📧")} メール</dt><dd><a href="mailto:${p.email}">${p.email}</a></dd>
      </dl>
      <a class="gmap-link" href="${p.url}" target="_blank" rel="noopener">${iconFor("🌐")} 公式サイトを開く</a>`;
    el.appendChild(card);
  });
}

function renderEmergencyContacts() {
  const el = document.getElementById("emergency-list");
  el.innerHTML = "";
  EMERGENCY_CONTACTS.forEach((c) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    const isPlainPhone = !c.phone.startsWith("TBD") && !c.phone.includes("／");
    const phoneHtml = isPlainPhone
      ? `<a class="contact-phone" href="tel:${c.phone.replace(/[^\d]/g, "")}">${iconFor("📞")} ${c.phone}</a>`
      : `<span class="contact-phone">${iconFor("📞")} ${fieldOrTbd(c.phone)}</span>`;
    card.innerHTML = `
      <div class="contact-category">${c.category}</div>
      <div class="contact-name">${c.name}</div>
      ${phoneHtml}
      ${c.hours ? `<p class="contact-hours">${c.hours}</p>` : ""}
      ${c.note ? `<p class="contact-note">${c.note}</p>` : ""}`;
    el.appendChild(card);
  });
}

function renderTransitLinks() {
  const el = document.getElementById("transit-links");
  el.innerHTML = "";
  TRANSIT_LINKS.forEach((t) => {
    const a = document.createElement("a");
    a.className = "transit-link-card";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `${iconFor(t.icon)} <span>${t.label}</span> ${t.note ? `<small>${t.note}</small>` : ""}`;
    el.appendChild(a);
  });
}

function renderAnaNotices() {
  const el = document.getElementById("ana-notices");
  el.innerHTML = "";
  ANA_NOTICES.forEach((n) => {
    const card = document.createElement("div");
    card.className = "ana-notice-card";
    card.innerHTML = `
      <div class="ana-notice-head">
        <span class="ana-notice-icon">${iconFor(n.icon)}</span>
        <h4 class="ana-notice-title">${n.title}</h4>
      </div>
      <p class="ana-notice-body">${n.body}</p>`;
    el.appendChild(card);
  });
}

renderParkingInfo();
renderEmergencyContacts();
renderTransitLinks();
renderAnaNotices();

// ============================================================
// 持ち物チェックリスト（端末ごとのlocalStorage保存）
// ============================================================

const STORAGE_KEY = "hiroshima-packing-v1";

function loadPacking() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { checked: {}, custom: [] };
  } catch {
    return { checked: {}, custom: [] };
  }
}
function savePacking(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const packingState = loadPacking();
const packingListEl = document.getElementById("packing-list");
const packingForm = document.getElementById("packing-form");
const packingInput = document.getElementById("packing-input");

function renderPacking() {
  packingListEl.innerHTML = "";
  const baseItems = data.packingList || [];
  const allItems = [
    ...baseItems.map((name) => ({ name, custom: false })),
    ...packingState.custom.map((name) => ({ name, custom: true })),
  ];

  allItems.forEach(({ name, custom }, i) => {
    const checked = !!packingState.checked[name];
    const li = document.createElement("li");
    li.className = "packing-item" + (checked ? " checked" : "");
    const id = `pack-${i}`;
    const showRemove = custom;
    li.innerHTML = `
      <input type="checkbox" id="${id}" ${checked ? "checked" : ""}>
      <label for="${id}"></label>
      ${showRemove ? `<button type="button" class="packing-remove" aria-label="削除">${iconFor("✕")}</button>` : ""}`;
    li.querySelector("label").textContent = name;

    li.querySelector("input").addEventListener("change", (e) => {
      packingState.checked[name] = e.target.checked;
      savePacking(packingState);
      li.classList.toggle("checked", e.target.checked);
    });

    const removeBtn = li.querySelector(".packing-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        packingState.custom = packingState.custom.filter((n) => n !== name);
        delete packingState.checked[name];
        savePacking(packingState);
        renderPacking();
      });
    }

    packingListEl.appendChild(li);
  });
}

packingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = packingInput.value.trim();
  if (!name) return;
  if (!packingState.custom.includes(name) && !(data.packingList || []).includes(name)) {
    packingState.custom.push(name);
    savePacking(packingState);
    renderPacking();
  }
  packingInput.value = "";
});

// ============================================================
// ページ切り替えタブ（旅程 / お土産 / 持ち物）
// ============================================================

const pageTabsEl = document.getElementById("page-tabs");
const PANEL_IDS = ["itinerary", "souvenir", "packing", "info"];

function switchPanel(key, { updateHash = true } = {}) {
  if (!PANEL_IDS.includes(key)) key = "itinerary";

  // 旅程タブを離れるとき、編集シート・ピン指定が開いたままにならないようにする
  if (key !== "itinerary") {
    if (picking) cancelPick();
    if (!editSheet.hidden) closeEditForm();
  }
  if (key !== "info" && !lodgingEditSheet.hidden) closeLodgingEditForm();

  PANEL_IDS.forEach((id) => {
    document.getElementById(`panel-${id}`).hidden = id !== key;
  });
  pageTabsEl.querySelectorAll(".page-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.panel === key);
    btn.setAttribute("aria-pressed", String(btn.dataset.panel === key));
  });

  if (key === "itinerary") {
    // 非表示中にサイズ計算が狂うので再計算
    map.invalidateSize();
  } else if (mapPane.classList.contains("open")) {
    closeMapSheet();
  }

  if (updateHash) {
    // location.hash 代入だと同名要素へスクロールする恐れがあるため replaceState
    history.replaceState(null, "", key === "itinerary" ? location.pathname + location.search : `#${key}`);
  }
  window.scrollTo({ top: 0 });
}

pageTabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".page-tab");
  if (btn) switchPanel(btn.dataset.panel);
});

// stickyオフセット用にタブナビの実測高さをCSS変数へ反映
function syncPageTabsHeight() {
  document.documentElement.style.setProperty(
    "--page-tabs-h",
    `${pageTabsEl.offsetHeight}px`
  );
}
window.addEventListener("resize", syncPageTabsHeight);
syncPageTabsHeight();

// #souvenir / #packing 付きURLで直接そのタブを開ける
function applyPanelFromHash() {
  const key = location.hash.replace("#", "");
  switchPanel(PANEL_IDS.includes(key) ? key : "itinerary", { updateHash: false });
}
// タブ切り替えは replaceState を使うため hashchange は発火しない
// （外部からのハッシュ付き遷移・ブラウザ操作のみ拾う）
window.addEventListener("hashchange", applyPanelFromHash);
if (PANEL_IDS.includes(location.hash.replace("#", ""))) {
  applyPanelFromHash();
}

// ============================================================
// 起動
// ============================================================

let firstLoad = true;

initDataLayer((newData) => {
  data = newData;
  if (!Array.isArray(data.lodging)) data.lodging = JSON.parse(JSON.stringify(DEFAULT_LODGING));
  renderHeader();

  if (firstLoad) {
    firstLoad = false;
    // 旅行当日はその日のタブを最初に表示
    if (tripDayIndex !== null && tripDayIndex >= 0 && tripDayIndex < data.days.length) {
      currentDayIndex = tripDayIndex;
    }
    // ?demo を付けるとFirebase未設定でも編集UIを試せる（保存はされない）
    const demoEdit = new URLSearchParams(location.search).has("demo");
    if (canEdit || demoEdit) editToggle.hidden = false;
  }
  if (currentDayIndex >= data.days.length) currentDayIndex = 0;

  renderTabs();
  renderDay();
  renderPacking();
  renderLodging();
}).catch((err) => {
  console.error("旅程データの読み込みに失敗しました:", err);
  timelineEl.innerHTML =
    '<li style="color:#a02f13">旅程データの読み込みに失敗しました。</li>';
});
