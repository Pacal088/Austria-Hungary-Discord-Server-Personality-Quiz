// Edit this file to customize your statements and which axes they affect.
// Each question has `text` and an `effect` object mapping axis keys to weights.
// Positive weight means agreeing boosts the RIGHT side, negative boosts the LEFT side.
// hist: { left: "Yhorm", right: "Pacal" },
// val: { left: "Frakk",   right: "Porg"   },
// prog: { left: "Owl",  right: "Abe" },
// cult:  { left: "The People", right: "Inami" }
// Positive numbers boost the right label; negative numbers boost the left.


const QUESTIONS = [
  { text: "Public services should be funded even if it requires higher taxes.", effect: { hist: 1, prog: -1 } }, 
  { text: "Abortion is an immoral act that should be banned or significantly limited..", effect: { hist:  -1, val: 1, prog: 1  } },
  { text: "Topping a twink is not as gay as getting pegged", effect: { hist:  1, prog: 1  } },
  { text: "Traditional values should be preserved even as society changes.", effect: { hist:  -1, val: 1, prog: 2, cult: 1   } },
  { text: "Some people and their ancestors have a quality of excellence that gives them the right to lead others.", effect: { hist:  -1, cult: 2 } },
  { text: "Morality is subjective.", effect: { hist: 1, val: -1 } },
  { text: "I can ride a horse.", effect: { cult: 1 } },
  { text: "Cannibalism is always immoral.", effect: { hist:   -1, val: 1  } },
  { text: "I believe gender is independent of assigned sex.", effect: { hist: 1, val: -1, prog: 1 } },
];
