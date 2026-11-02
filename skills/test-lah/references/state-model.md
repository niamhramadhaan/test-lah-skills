# State model coverage

For each module with a lifecycle (alert, order, reservation, device), do this before writing cases.

1. List the states and the transitions between them, from code (status enums, reducers, API actions) and the UI. One small table: From, Action, To, Guard (condition).
2. Write one case per transition, plus one negative case per forbidden transition that the UI or API should refuse.
3. Name the rules that must hold in every state ("a resolved alert never counts toward the open total"). Check each rule on every screen that shows the data.
4. Report coverage: transitions tested of total, rules checked of total.
5. When a rule breaks, record the shortest sequence of steps that reaches the broken state. That sequence is the "Minimal steps to reproduce" in the issues table.

If a transition cannot be triggered in the environment, mark its case Blocked and say what is needed.
