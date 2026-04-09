import React from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import { calcNeeds, getMealPlan } from '../utils/calc';

export default function Plan() {
  const { profile } = useStore();
  const needs = profile ? calcNeeds(profile.weight, profile.height, profile.age, profile.goal) : null;
  const meals = getMealPlan(needs, profile?.weight);

  const shoppingList = [
    { cat: "بروتين", items: ["كرتونة بيض", "صدور فراخ (2kg)", "تونة معلبة", "لبن كامل الدسم"] },
    { cat: "كربوهيدرات", items: ["أرز بني / بسمتي", "توست أسمر", "موز / تفاح / تمر", "شوفان"] },
    { cat: "دهون سلبية", items: ["مكسرات (لوز، كاجو)", "زبدة فول سوداني", "زيت زيتون بكر"] },
  ];

  return (
    <div className="slide-up" style={{ padding: "18px 16px" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📝 خطة الأكل والمكملات</div>

      {/* Meals */}
      {meals.map((meal, i) => (
        <div key={meal.id} className="card" style={{ marginBottom: 12, borderRight: `4px solid ${THEME.blue}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>{meal.emoji}</span>
              <span style={{ fontWeight: 800 }}>{meal.name}</span>
            </div>
            <div style={{ fontSize: 11, background: THEME.card2, padding: "4px 10px", borderRadius: 8, color: THEME.muted2 }}>{meal.time}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            {meal.items.map((item, idx) => (
              <div key={idx} style={{ fontSize: 13, marginBottom: 4, color: THEME.text }}>• {item}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
             <span style={{ fontSize: 11, color: THEME.orange }}>🔥 {meal.cal} kcal</span>
             <span style={{ fontSize: 11, color: THEME.blue }}>💪 {meal.protein}g P</span>
          </div>
          <div style={{ fontSize: 11, color: THEME.muted, borderTop: `1px solid ${THEME.border}`, paddingTop: 8, marginTop: 4 }}>
            💡 {meal.tip}
          </div>
        </div>
      ))}

      {/* Supplement Schedule */}
      <div className="card" style={{ marginBottom: 16, borderRight: `4px solid ${THEME.purple}` }}>
        <div className="card-title">💊 مواعيد المكملات</div>
        {[
          { name: "كرياتين مونوهيدرات", time: "5g بعد التمرين فوراً", note: "اشربه مع عصير أو ميه كتير", color: THEME.blue },
          { name: "زنك / ZMA", time: "قبل النوم بمدة", note: "بيحسن جودة النوم وهرمون التستوستيرون", color: THEME.purple }
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: s.color }}>{s.name}</div>
            <div style={{ fontSize: 12, color: THEME.text, marginTop: 2 }}>{s.time}</div>
            <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>📍 {s.note}</div>
          </div>
        ))}
      </div>

      {/* Shopping List */}
      <div className="card">
        <div className="card-title">🛒 قائمة التسوق الأسبوعية</div>
        {shoppingList.map((cat, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.green, marginBottom: 6 }}>{cat.cat}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cat.items.map(item => (
                <span key={item} style={{ padding: "4px 10px", background: THEME.card2, borderRadius: 8, fontSize: 11, border: `1px solid ${THEME.border}` }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
