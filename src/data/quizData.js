import { QUIZ_DATA } from './questions';

export const DATA = QUIZ_DATA;
export const ALL_Q = [];
export const Q_BY_ID = {};

DATA.items.forEach(it =>
  it.questions.forEach(q => {
    const obj = { ...q, itemNum: it.num, itemTitle: it.title };
    ALL_Q.push(obj);
    Q_BY_ID[q.id] = obj;
  })
);

export const TOTAL_Q = ALL_Q.length;

export function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
