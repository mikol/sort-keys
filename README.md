# sort-keys

Recursively sorts all JavaScript object properties into ES6 “own property keys”
traversal order so that when properties are enumerated by other operations like
`JSON.stringify()`, they are enumerated deterministically.

Prior to ES6, enumeration order for object keys was unspecified. ES6 specifies
that all 32-bit integer indices (`'0'`, `'1'`, `'2'`, and so on) be enumerated
in ascending numerical order, followed by string keys (`'a'`, `'01'`, and so on)
in ascending alphabetical order. But only for certain types of enumeration (for
example: `Refelect.ownKeys()`, not `Object.keys()`). Ultimately, enumeration
order is determined by each JavaScript engine, but extracting, sorting, and
re-inserting keys should yield a run-time consistent enumeration order for
like-objects.
