export function calcNeeds(weight, height, age, goal = "bulk") {
  const w = parseFloat(weight) || 60;
  const h = parseFloat(height) || 170;
  const a = parseInt(age) || 22;
  
  // Mifflin-St Jeor Equation
  const bmr = 10 * w + 6.25 * h - 5 * a + 5;
  const activityMultiplier = 1.55; // Moderate Activity
  const tdee = Math.round(bmr * activityMultiplier);
  
  let calories = tdee;
  if (goal === "bulk") calories += 500;
  else if (goal === "cut") calories -= 500;
  
  return {
    calories,
    protein: Math.round(w * 2.2),
    carbs: Math.round(w * 4.5),
    fat: Math.round(w * 1.1),
    waterMl: Math.max(2500, Math.round((w * 40 + 500) / 250) * 250),
    zinc: 30,
  };
}

export function getMealPlan(needs, weight) {
  if (!needs) return [];
  const w = parseFloat(weight) || 60;
  return [
    {
      id: "breakfast", time: "8:00 ص", emoji: "🌅", name: "الفطار",
      cal: Math.round(needs.calories * 0.25), protein: Math.round(needs.protein * 0.25), carbs: Math.round(needs.carbs * 0.25),
      items: ["3 بيض مقلي أو مسلوق", "2 توست أسمر + زبدة طبيعية", "كوباية لبن كامل الدسم (250ml)", "موزة كبيرة"],
      tip: "الفطار أهم وجبة في يومك — متعديهاش حتى لو مش جعان!",
    },
    {
      id: "snack1", time: "11:00 ص", emoji: "🥜", name: "سناك الصبح",
      cal: Math.round(needs.calories * 0.1), protein: Math.round(needs.protein * 0.08), carbs: Math.round(needs.carbs * 0.12),
      items: ["30g مكسرات (لوز + كاجو)", "3-4 تمرة", "تفاحة أو موزة"],
      tip: "السناك ده يحافظ على مستوى الطاقة ويمنعك تاكل قليل في الغداء.",
    },
    {
      id: "lunch", time: "2:00 م", emoji: "🍗", name: "الغداء",
      cal: Math.round(needs.calories * 0.35), protein: Math.round(needs.protein * 0.35), carbs: Math.round(needs.carbs * 0.35),
      items: [`${Math.round(w * 1.5 + 50)}g صدر فراخ مشوي أو بلدي`, "كوب أرز بني أو معكرونة إنتيجرال", "خضروات مطبوخة (جزر + بازلا + فلفل)", "سلطة خضراء بزيت زيتون"],
      tip: "دي أكبر وجبة في اليوم — مش ضروري تاكلها كلها مرة واحدة.",
    },
    {
      id: "preworkout", time: "5:30 م", emoji: "⚡", name: "قبل التمرين (45 دقيقة قبل)",
      cal: Math.round(needs.calories * 0.12), protein: Math.round(needs.protein * 0.05), carbs: Math.round(needs.carbs * 0.15),
      items: ["2 موزة", "كوباية عصير برتقال طبيعي (5g كرياتين فيه)", "3-4 تمرة"],
      tip: "الكارب السريع ده هيشحنك وهتحس بفرق كبير في التمرين.",
    },
    {
      id: "postworkout", time: "7:30 م", emoji: "💪", name: "بعد التمرين (فوراً)",
      cal: Math.round(needs.calories * 0.15), protein: Math.round(needs.protein * 0.2), carbs: Math.round(needs.carbs * 0.1),
      items: ["شيك بروتين أو كوباية لبن بالكاكاو", "موزة", "5g كرياتين (لو ما أخدتوش قبل)"],
      tip: "الـ 30 دقيقة دول هم أهم وقت لامتصاص البروتين وبناء العضلات.",
    },
    {
      id: "dinner", time: "9:30 م", emoji: "🌙", name: "العشاء",
      cal: Math.round(needs.calories * 0.13), protein: Math.round(needs.protein * 0.15), carbs: Math.round(needs.carbs * 0.05),
      items: ["150g تونة أو سمك بلطي مشوي", "خبز أسمر (2 توست)", "زبادي طبيعي (150g)", "سلطة خيار وطماطم"],
      tip: "البروتين قبل النوم بيساعد في بناء العضلات أثناء النوم (anabolic window).",
    },
  ];
}
