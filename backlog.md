# backlog

Open work for this repo, per `AISmith-Factory` -> `docs/backlog-convention.md` v0.2.
**Created 2026-08-03.** The convention has required a root `backlog.md` in every fleet
repo since 2026-07-09; this repo did not have one, and nothing checked until
`scripts/backlog-lane-check.sh` was written. Seven repos were missing it.

## Line format

```
- [ ] [ai|al|pair|factory] <title> -- input: <where> -- done when: <check>
```

- `[ai]` -- the dispatcher executes it.
- `[al]` -- needs the operator.
- `[pair]` -- the dispatcher drafts, the operator go/no-goes.
- `[factory]` -- **a learning owed UPSTREAM.** See below.

## The `[factory]` lane -- read this before adding one

A `[factory]` line is something THIS repo learned that would improve Factory canon:
a build lesson, a method that failed, a grammar the standard could not express.

```
- [ ] [factory] <what was learned> -- input: <where it bit> -- applies to:
  <canon doc it would improve> -- done when: Factory folds or rejects, recorded here
```

**`applies to` is load-bearing** -- it is what turns a war story into a routable patch.
A learning that cannot name a canon doc it would improve is a note; file it under
`[ai]`/`[al]` instead.

**This lane exists because every other one is bound to the audit cycle.** A manifest is
emitted at an AUDIT, so `raised_to_factory` carries only what a rubric row already asked
about -- and work that is never audited (a Google Workspace migration, a DNS cutover, a
host move) has no emit point at all. `backlog.md` is the only file every repo carries.

**A `[factory]` line is closed by the FACTORY, never by this repo.** The Factory sweeps
these at each Trigger-2 reconcile and records the outcome here. If one sits unresolved for
more than a cycle, that is a finding against the Factory, not against this repo.

## Open

_(none yet)_
