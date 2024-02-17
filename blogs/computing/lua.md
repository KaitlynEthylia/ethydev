---
title: The Lua 5.4 Binary Chunk Format.
date: 2024-02-17
contents: true
---

## Introduction

Recently I decided that I wanted to take on the challenge of creating
an assembler for Lua binary chunks. The main reason being simply that
I really like Lua as a language, and it served as a fun way to learn
more about it's internals. As of writing this, the assembler is not
yet done but it's getting there. Naturally, I had to figure out the
binary format of chunks in Lua, so that I could create them myself,
And I figured it might be nice to document my findings here.

I chose to target Lua 5.4 for a number of reasons: firstly, it's the
most recent version of Lua, and I like it quite a bit more than 5.1,
which seems like fair enough reason itself personally, but also,
Lua 5.1 is quite well documented, as is 5.2 to a certain extent.
Assemblers have been done for those versions, and as it turns out,
there is a sufficiently large difference between 5.1 and 5.4, so I
thought it would be fun to do similar for 5.4.

Eventually I found looking at source code to be the most effective way
to figure things out, and I will provide references to the source code
at a number of points, but one of the most useful resources getting
started on this was [A No-Frills Introduction To The Lua 5.1 VM](https://www.scribd.com/document/119972975/A-No-Frills-Introduction-to-Lua-5-1-VM-Instructions).
Naturally, where this breaks down is in the differences between 5.1
and 5.4, but by-and-large it was, and is, incredibly useful.

This post isn't going to emulate the information in that document,
only with changes for 5.4,

> I mean, did you read the first 3 paragraphs? There are plenty of
> frills here. I think I may be allergic to the phrase 'To the point'.

and I would suggest reading it yourself if you're trying to learn
about Lua; I wont be covering each of the instructions in detail, and
many of them have not changed from their description in there.

---
## A Brief Look At A Hex Dump

Let's start by just simply creating a file called `test.lua` and hex
dumping it to see what we get. We can compile it into a binary file
using `luac`.

```sh
touch test.lua
luac -o out.lc test.lua
xxd test.lc
```
```
00000000: 1b4c 7561 5400 1993 0d0a 1a0a 0408 0878  .LuaT..........x
00000010: 5600 0000 0000 0000 0000 0000 2877 4001  V...........(w@.
00000020: 8a40 7465 7374 2e6c 7561 8080 0001 0282  .@test.lua......
00000030: 5100 0000 4600 0101 8081 0100 0080 8201  Q...F...........
00000040: 0080 8081 855f 454e 56                   ....._ENV
```

There's a small amount we can guess from this alone. The 'Lua' bytes
at the beginning almost certainly a magic number of sorts, or part of
one. `@test.lua` is the name of the file that created the binary
chunk, We can't be sure yet if the '@' is part of it, but I'll tell
you now that it is. And lastly, we see an `_ENV` at the end.

Interestingly there also seems to be a lot of 0x80 bytes.

If we want we can compare this to a hex dump of the same empty file
but in Lua 5.1.

```
00000000: 1b4c 7561 5100 0104 0804 0800 0a00 0000  .LuaQ...........
00000010: 0000 0000 4074 6573 742e 6c75 6100 0000  ....@test.lua...
00000020: 0000 0000 0000 0000 0202 0100 0000 1e00  ................
00000030: 8000 0000 0000 0000 0000 0100 0000 0100  ................
00000040: 0000 0000 0000 0000 0000                 ..........
```
Well that's interesting. Now we have LuaQ instead of LuaT, but if we
look at the hex bytes for Q and T, (0x51 and 0x54), It's pretty clear
that that's the version number. There also don't seem to be many 0x80
bytes, and a good number of null bytes.

> The lack of _ENV at the end is most likely due to _ENV not existing
in 5.1.

Well that's the obvious covered, but let's take a look at what's
actually happening here.

---
## The Header

As somebody familiar with binary formats might expect, the file begins
with a header. The length of the header depends how lua was compiled,
but on most distributions it will be 32 bytes.

We can find the code where the header is written in `ldump.c:201` in
the function aptly named `dumpHeader`:

```c
// ldump.c:201
static void dumpHeader (DumpState *D) {
  dumpLiteral(D, LUA_SIGNATURE);
  dumpByte(D, LUAC_VERSION);
  dumpByte(D, LUAC_FORMAT);
  dumpLiteral(D, LUAC_DATA);
  dumpByte(D, sizeof(Instruction));
  dumpByte(D, sizeof(lua_Integer));
  dumpByte(D, sizeof(lua_Number));
  dumpInteger(D, LUAC_INT);
  dumpNumber(D, LUAC_NUM);
}
```

It starts by writing the magic number. That's the '0x1b Lua' at the
start of the file. And then as we saw, the verion in hexadecimal

The next byte is the format. In all chunks compiled with luac, this
byte will be 0. 0 means it's using the 'official' binary chunk format.
Lua will refuse to load any binary chunks written in a different
format to the one it's compiled to understand.

Next we dump LUAC_DATA, this is the first section that is properly
different from Lua 5.1. This was added in Lua 5.3 and is simply some
'check data' to check that the file is in tact. Lua will not load the
chunk if the test data doesn't match what Lua was compiled with. The
check data are the bytes `19 93 0D 0A 1A 0A`. `19 93` is most likely a
reference to the year Lua was created; `0D` and `0A` are the
line-ending bytes; I'm not sure what the `1A 0A` bytes might mean,
they could simply be randomly chosen.

In 5.1, instead of LUAC_DATA, there was a single byte acting as an
'Endianness flag', 0 meaning big endian, and 1 meaning little endian.

> I'd love to do some more tests on how binary chunks handle
> endianess, but unfortunately I don't have a big endian machine, and
> I haven't yet been able to emulate one. I'll update this post if I
> I manage to.

After this is the size of a Lua machine instruction in bytes. This
should always be at least 4 bytes. On machines with 16 bit integers,
instructions are stored as unsigned longs.

Next is the size of lua integers, followed by the size of numbers,
which on most machines will both be 8 bytes. Lua 5.1 has similar size
information here, but instead it stores the size of C's `size_t`, and
`int` types, and then the instruction size and number size.

In 5.1 The last byte of the header is a flag see if the number type is
'integral' (i.e. can only store integers). As 5.4 keeps integers and
non-integers as seperate types, this isn't present.

Instead we have some more check data. First, the integer 22136
(0x5678), Which is stored as `7856 0000 0000 0000`. I imagine this may
also function in place of 5.1's 'Endianeness flag', as it would be
`0000 0000 0000 5678` on a big endian machine, and thus would not mach
the check data.

And then the number 370.5: `0000 0000 0028 7740`, which ends the
header.

### Secret Byte 32

That actually only accounts for 31 bytes, not the 32 I promised.
That's because there is one extra byte before we get to the main code,
but It's not treated as part of the header. I assume that's because
the header is actually all check data, all of it is only used to make
sure the Lua interpreter trying to load the chunk is compatible with
whatever was expected by the chunk.

We can look again inside the code, and see the entirety of what Lua
does with the header:

```c
// lundump.c:292
static void checkHeader (LoadState *S) {
  /* skip 1st char (already read and checked) */
  checkliteral(S, &LUA_SIGNATURE[1], "not a binary chunk");
  if (loadByte(S) != LUAC_VERSION)
    error(S, "version mismatch");
  if (loadByte(S) != LUAC_FORMAT)
    error(S, "format mismatch");
  checkliteral(S, LUAC_DATA, "corrupted chunk");
  checksize(S, Instruction);
  checksize(S, lua_Integer);
  checksize(S, lua_Number);
  if (loadInteger(S) != LUAC_INT)
    error(S, "integer format mismatch");
  if (loadNumber(S) != LUAC_NUM)
    error(S, "float format mismatch");
}
```

The next byte, however, is actually used and not just checked. It is
the number of upvalues of the root function. The 'root function' Is
the function encompasing the entire chunk. In a chunk compiled from a
file, that's all the code in the file. All functions declared in that
file are nested functions within the root function.

When creating a new instance of a function, the Lua VM needs to know
the number of upvalues it has:

```c
// lfunc.h:52
LUAI_FUNC LClosure *luaF_newLclosure (lua_State *L, int nupvals);
```
(LClosure just means a closure written in Lua, there is an equivalent
line for C closures)

With all nested functions in the chunk, the functions aren't
instantiated until we call the `CLOSURE` instruction. At which point
all function prototypes and their headers have already been loaded, so
we can check how many upvalues are defined for the prototype:

```c
// lvm.c:788
static void pushclosure (lua_State *L, Proto *p, /*...*/) {
  int nup = p->sizeupvalues;
  Upvaldesc *uv = p->upvalues;
  int i;
  LClosure *ncl = luaF_newLclosure(L, nup);
  // ...
```

At this point however, we haven't loaded anything except the chunk
header, so the number of upvalues of the root function is stored
before the function prototype begins. In Lua 5.1 this is not needed,
as a binary chunk is loaded as a function prototype, whereas in 5.4 it
is loaded as a fully instantiated closure (Presumably as a result of /
in conjunction with the change in how function environments work / the
introduction of _ENV).

---
## Formats

So that's the first 32 bytes. The entire rest of the file is the
function prototype for the root function. So It makes sense to talk
about function prototypes next, but first I want to take a brief
detour to talk about how a few things are stored. This section will be
short, but it'll be nicer than having the information dispersed
throughout different sections.

### Counts

I call this section 'counts' because if I call it numbers, it sounds
like I'm referring to Lua's number type, which is stored as a fixed
number of bytes. Counts are used when describing the size of things
like lists, which are a `size_t` in C but stored differently in the
binary. In Lua 5.1 they were not stored any differently and were a
fixed number of bytes. This appears to have changed in 5.3 but I have
not looked into how it worked there, as it changed again in 5.4.

Counts are stored in always big-endian with the first 7 bits of each
byte being part of the number, and the most significant being an
ending marker. This is the reason for all of the `0x80` in the 5.4 hex
dump, but not in 5.1. This refers to 0, as the first 7 bits are all 0,
and the most significant bit is a 1, meaning its the last byte in the
count. A number like 300, 0x012C, which cannot be stored in 7 bits,
would be stored as 0x02AC.

This is easiest to see in the binary representation:

300 stored normally:

`0000000(1) (00101100)`

300 stored in this format:

`000000(10) 1(0101100)`

The source code for this one is maybe a little bit harder to read, but
such is the modus operandi of bit manipulation. Regardless, here it is
for the curious:

```c
// ldump.c:65
static void dumpSize (DumpState *D, size_t x) {
  lu_byte buff[DIBS];
  int n = 0;
  do {
    buff[DIBS - (++n)] = x & 0x7f;  /* fill buffer in reverse order */
    x >>= 7;
  } while (x != 0);
  buff[DIBS - 1] |= 0x80;  /* mark last byte */
  dumpVector(D, buff + DIBS - n, n);
}
```

### Lists

Lists are used *extensively* within the chunk, they are used to store
functions, constants, upvalues, strings. This *doesn't* refer to lists
as in sequential tables. There'll be a note about those later, in
short, they aren't stored at all.

With counts explained, lists are quite simple, lists first store their
length as a count, and then they place each element sequentially. The
size or end of each element will be known, so the list doesn't need to
delimit them in any way.

### Strings

Strings are just a list of bytes. The bytes can be ASCII characters,
Unicode characters, even null. The odd thing about strings is that
despite not being null-terminated. The size stored at the beginning of
the list is actually 1 greater than the number of bytes:

```c
// ldump.c:92
static void dumpString (DumpState *D, const TString *s) {
  if (s == NULL)
    dumpSize(D, 0);
  else {
    size_t size = tsslen(s);
    const char *str = getstr(s);
    dumpSize(D, size + 1);
    dumpVector(D, str, size);
  }
}
```

I'm not entirely sure why this is, but my best guess is to distinguish
between an empty string (a count of 1, 0x81, followed by nothing), and
no string at all (a count of 0, 0x80).

---
## Closure Like a Deer in Headlights

So far I've used the words 'Function', 'Function prototype',
'Closure', and 'Instantiated function', without clarifying their
differences. I'll make it clear here that when I say 'Function', I
really mean 'Function prototype', and when I say 'Closure', I really
mean 'Instantiated function' (or the other way around? Regardless,
I am using them interchangeably.)

A function prototype contains all the information necessary to create
the function, such as the instructions, any constants it uses, etc.
but it doesn't actually have the values of any of its upvalues, just a
description of what upvalues it requires.

A closure is an instantiation of a function prototype with its
associated upvalues. There can be multiple instantiations of a
function prototype, each with different associated upvalues.

For example:

```lua
function a(b)
	return function()
		print(b)
	end
end
```

In this code, function `a` has one function prototype: the function
that it returns. But every time `a` is called, it will create and
return a new closure over that prototype, and the parameter `b`.

This will be discussed in more detail later, after I've explained how
function prototypes are stored.

---
## Function Header

Functions don't really have a 'header', if you look at the source code
where the function prototype is dumped, it's really just a series of
'stuff':

```c
// ldump.c:183
static void dumpFunction (DumpState *D, const Proto *f, TString *psource) {
  if (D->strip || f->source == psource)
    dumpString(D, NULL);  /* no debug info or same source as its parent */
  else
    dumpString(D, f->source);
  dumpInt(D, f->linedefined);
  dumpInt(D, f->lastlinedefined);
  dumpByte(D, f->numparams);
  dumpByte(D, f->is_vararg);
  dumpByte(D, f->maxstacksize);
  dumpCode(D, f);
  dumpConstants(D, f);
  dumpUpvalues(D, f);
  dumpProtos(D, f);
  dumpDebug(D, f);
}
```

But it's easier to talk about if we just pretend everything before the
code is part of a header, as its short and doesn't take much talking
about, and everything after and including the code as the body,
because each of those will take longer to talk about.

Firstly is a string that refers to the source of the function. This is
only used as debug data, so you can see in the code above, that if
stripping debug symbols is enabled, no string is output (i.e. a count
of 0, as an explicit declaration of there not being a string, this
needs to be done as if the string were omitted entirely, there would
be no way to tell that the next bytes aren't the string).

Chunks compiled by Lua will only give a source name to the root
function. The source of any child functions is inferred from the root.

When compiled from a file, Lua will give the source name as an '@'
symbol, followed by the filename. From other sources, it will begin
with an '=', such as '=stdin' from stdin, '=(load)' from the `load()`
Lua function, or '=?' from an unknown source.

Next two sections are the lines the function begins and ends on as
counts. For the root function you might expect that it would begin on
0, and end on the last line of the file, but it is actually always
encoded as 0 for both counts.

After that is a byte containing the number of named parameters (i.e,
not including '...')

Next is a flag defining whether or not the function has varags, 1 if
it does, 0 if it does not. In Lua 5.1, this was a bit field containing
some more flags, those had to do with compatibility with how varargs
worked prior to 5.1, but that compatibility appears to no longer be
present.

Lastly is byte representing the maximum number of places on the stack
the function may end up using, or in other words, the minimum stack
size that needs to be available in order to call the function. This
allows Lua to check that there is enough stack space before calling a
function.

---
## The Code

The first list in the function 'body', is the actual machine
instructions.

Like any list, it begins with its size. And then each instruction
sequentially. As was already mentioned, instructions will be 4 bytes
long on the vast majority of platforms, and never fewer.

```c
// llimits.h:195
/*
** type for virtual-machine instructions;
** must be an unsigned with (at least) 4 bytes (see details in lopcodes.h)
*/
#if LUAI_IS32INT
typedef unsigned int l_uint32;
#else
typedef unsigned long l_uint32;
#endif

typedef l_uint32 Instruction;
```

I don't see why anyone would ever change this, but given that the file
header lists the instruction size, its clearly a supported option. So
let's see what happens if you change those definitions.

Trying this out with Lua compiled with 8 byte instructions shows that,
as one may expect, the first 4 bytes are filled with the actual
instruction data, and the remaining available bytes are all just null
bytes.

### Instruction Format

An instruction format is made up of an opcode, and between 1 and 4
arguments. It is described quite well by this header in `opcodes.h`:

```c
/*======================================================================
  We assume that instructions are unsigned 32-bit integers.
  All instructions have an opcode in the first 7 bits.
  Instructions can have the following formats:

        3 3 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0
        1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
iABC          C(8)     |      B(8)     |k|     A(8)      |   Op(7)     |
iABx                Bx(17)               |     A(8)      |   Op(7)     |
iAsBx              sBx (signed)(17)      |     A(8)      |   Op(7)     |
iAx                           Ax(25)                     |   Op(7)     |
isJ                           sJ (signed)(25)            |   Op(7)     |

  A signed argument is represented in excess K: the represented value
  is the written unsigned value minus K, where K is half the maximum
  for the corresponding unsigned argument.
======================================================================*/
```

There are some certain oddities to it though, so I'll talk about those
as well as explaining the header.

Firstly, as I'm running a little-endian machine, and you likely are
too, they're quite a bit harder to read in the hex dump, but that goes
with most things in little-endian.

This is also quite different from Lua 5.1. In 5.1, opcodes were 6
bits, the 'k' argument didn't exist, and both b and c were 9 bits.
There were also no `iAx` or `isJ` variants. I won't be covering the
differences from 5.1 in too much depth here, as this is about Lua 5.4,
and whilst some differences are small enough to bring up in notes, if
you want to learn about 5.1, I suggest reading the 'No-Frills
Introduction' that I linked at the beginning.

To rephrase the statement about signed arguments. A signed argument is
just interpreted with an offset, such that, as an 8 bit example,
`0x00` is the lowest possible value: -128, `0xFF` is the highest
possible value: 127, and `0x80`, is half way between those: 0.

> This is what I originally thought all the 0x80 bytes in the file
> were. I hadn't yet read `ldump.c` and assumed that they oddly chose
> to use these signed numbers for some reason. It was only later that
> I found it was a continuation bit.

I find it a little odd that the `isJ` variant is called that, and not
`isAx`, when the signed variant of `iBx` is `isBx`, but it is only
used for a single instruction: JMP (jump). So I assume it is short for
'signed jump'. In 5.1, The sBx argument was used for jump
instructions, and A was ignored.

I also find it strange that `isBx` and `iBx` are different at all.
There are a few instructions of the `iABC` form that take B signed,
and some that take C signed, yet `iAsBC` and `iABsC` are not separate
variants.

These are just trivial oddities though, they don't matter much, I just
felt like mentioning them.

As I said in the beginning, this isn't about the machine code
instructions. So I wont be describing every opcode, and what their
arguments do here, simply the format of instructions. But I would like
to bring attention to the EXTRAARG opcode. It is of the 'iAx' variant,
and acts as an extra argument for the previous instruction, if that
cannot fit within the available size, usually by concatenating the
bits with the C argument.

---
## Constants

After the list of instructions is the list of constants. Each function
has associated constants with it, such as literals, as well as the
names used for variables.

The function containing the code `a = 5` not only has the constant 5,
but also the constant 'a'. Some instructions may refer to a constant
by referring to its index in this list.

Each constant is output as a byte containing its type, and then
potentially its value. A constant can only be a simple type, i.e. nil,
a string, a boolean, or a number. Integers and non-integers are given
different types so that Lua knows how to interpret the next few bytes,
as are true and false, so that if the type is nil, true, or false,
there is no need to provide a value.

Table literals are not stored as constants, they are constructed at
runtime. i.e. The code `a = { b = 'a' }` will have 2 constants, 'a',
to refer to both the name of the assigned variable, and the value of
`b`, as well as 'b' to refer to the name of the field. The code will
then also contain the instructions to create the table (`NEWTABLE`),
add its fields from the constant list (`SETFIELD`), and store that as
a field in the upvalue `_ENV` (`SETTABUP`).

---
## Upvalues

This section is new from Lua 5.1, It describes where upvaules come
from when instantiating the function.

In 5.1, After the `CLOSURE` instruction, you would use the `GETUPVAL`
or `MOVE` 'pseudo-instructions'. The first argument would be ignored
and the upvalue would be set to either the register declared by the
second argument of `MOVE`, or the upvalue of the current function
declared in the second argument of `GETUPVAL`. The first call to a
pseudo-instruction would determine the first upvalue, the second call,
the second upvalue, etc.

In 5.4, the source of the upvalues is associated with the function
prototype itself in a list of upvalue descriptions.

```c
// lobject.h:515
typedef struct Upvaldesc {
  TString *name;  /* upvalue name (for debug information) */
  lu_byte instack;  /* whether it is in stack (register) */
  lu_byte idx;  /* index of upvalue (in stack or in outer function's list) */
  lu_byte kind;  /* kind of corresponding variable */
} Upvaldesc;
```

The comments on this struct explain it fairly well, but I'll explain
myself anyways. First the names associated with the upvalues are
written. If debug information is stripped, these will of course be
the byte `0x80`. Note that these aren't written in the upvalue list,
and are instead written in the debug section at the end of the
function prototype.

Next is whether or not the upvalue comes from a register (somewhere on
the stack), or is inherited as an upvalue from the current function
(the function in which this function is defined in). This is
equivalent to whether you use the `MOVE` or `GETUPVAL`
pseudo-instruction in 5.1.

After that is the index into that list. So the place on the stack, or
the number of the upvalue that its inheriting. This is equivalent to
the second argument given to the 5.1 pseudo-instruction.

Lastly is the 'kind' of the upvalue, which is specifically for 5.4's
new 'attribute' syntax. The kinds are:

```c
// lparser.h:90
#define VDKREG		0   /* regular */
#define RDKCONST	1   /* constant */
#define RDKTOCLOSE	2   /* to-be-closed */
#define RDKCTC		3   /* compile-time constant */
```

> I haven't yet figured out what is meant by 'compile-time constant'
> in this context, but I've never seen it appear. I'll add a note if I
> find out.
>
> either way, 99 out of 100 times you'll only have VDKREG anyways. And
> that's 100 out of 100 if you're particularly pessimistic about how
> useful attribute syntax is.

---
## Function Prototypes

This is the list of function prototypes defined within the function.
The `CLOSURE` instruction refers to an index in this list in order to
instantiate a function.

For a complete explanation of this section, please open this post in
another tab and begin recursively reading from the
[Function Header](#function-header) section.

---
## Debug Symbols

The last section is debug symbols. The function source name is present
in the 'function header', but all other debug symbols are in this
section.

If debug symbols are stripped, the function prototype will just end in
a list of four `0x80` count bytes, as there are 4 lists that make up
the debug section and they need to appear so Lua knows the size of the
prototype.

### Line Info

The length of this list should usually either be 0, or the same as the
length of the instruction list (In count, not bytes). It maps each
instruction to a line number.

In Lua 5.1, each element was a byte containing a line number relative
to the line the function was defined on. In 5.4 the first element is
relative to the start of the function, and each subsequent byte is
relative to the previous instruction. If the two instructions are more
than 127 lines apart in origin (somehow?) Then the byte `0x80` is
placed there, and all subsequent bytes are relative to a new baseline.

This `0x80` byte tells Lua to look in AbsLineInfo, the next debug
section, in order to find the line for that instruction.

After a 128 instructions without a reference to AbsLineInfo, Lua will
simply choose to insert a 0x80 byte anyways, in order to re-anchor it.

When interpreting line info, Lua looks for a baseline. Before a
`0x80`, that's the line the function was defined on, afterwards its
the line of most recent `0x80`, it then walks from that point in the
line info list (The beginning, or the location of a `0x80` byte) and
adds up all subsequent relative line numbers.

### AbsLineInfo

AbsLineInfo determines the new baseline for instructions when
encountering a `0x80` byte the line info.

This was not present in 5.1, and provides an anchor for the relative
line numbers in the line info debug section. Each element consists of
2 counts. The first is the programme counter it's anchoring against.
In other words, an index into the list of instructions. The next is an
absolute line number.

The macros 'MAXIWTHABS' and 'ABSLINEINFO' define how many instructions
Lua may go before anchoring back to AbsLineInfo, as well as which byte
to use for anchoring, which is 0x80 by default.

```c
// ldebug.h:27
#define ABSLINEINFO	(-0x80)
// ldebug.h:35
#define MAXIWTHABS	128
```

If my explanation was confusing, don't worry, that's normal, I'm a
terrible teacher, but of course here is the code to calculate an
instructions line number:

I've omitted some of the comments so it's not too long, but you can
always download the source yourself and read them.

```c
// ldebug.c:60
static int getbaseline (const Proto *f, int pc, int *basepc) {
  if (f->sizeabslineinfo == 0 || pc < f->abslineinfo[0].pc) {
    *basepc = -1;  /* start from the beginning */
    return f->linedefined;
  }
  else {
    int i = cast_uint(pc) / MAXIWTHABS - 1;  /* get an estimate */
    /* estimate must be a lower bound of the correct base */
    lua_assert(i < 0 ||
              (i < f->sizeabslineinfo && f->abslineinfo[i].pc <= pc));
    while (i + 1 < f->sizeabslineinfo && pc >= f->abslineinfo[i + 1].pc)
      i++;  /* low estimate; adjust it */
    *basepc = f->abslineinfo[i].pc;
    return f->abslineinfo[i].line;
  }
}

int luaG_getfuncline (const Proto *f, int pc) {
  if (f->lineinfo == NULL)  /* no debug information? */
    return -1;
  else {
    int basepc;
    int baseline = getbaseline(f, pc, &basepc);
    while (basepc++ < pc) {  /* walk until given instruction */
      lua_assert(f->lineinfo[basepc] != ABSLINEINFO);
      baseline += f->lineinfo[basepc];  /* correct line */
    }
    return baseline;
  }
}
```

### Locals

Next is the list of local variables, In Lua, local variables are just
positions on the stack, so each index into the locals debug list
refers to an index into the stack.

Each element consists first of the name associated with the local
variable, and then two counts, the first being the programme counter
(index into instruction list) where the local variable is created, and
the second being the programme counter where it ceases to exist.

### Upvalues

This is simply a list of strings corresponding to the names of the
upvalues defined in the upvalue list earlier.

---
## Annotating a Hex Dump

So I think that's everything, but it's not a very satisfying ending,
and examples are nice, So I want to spend a little while annotating a
very simple piece of Lua code:

```lua
function add(a, b)
	return a + b
end

print(add(3, 7))
```

After giving this to Luac to munch on, this was the resulting hex dump

```
00000000: 1b4c 7561 5400 1993 0d0a 1a0a 0408 0878  .LuaT..........x
00000010: 5600 0000 0000 0000 0000 0000 2877 4001  V...........(w@.
00000020: 873d 7374 6469 6e80 8000 0104 8a51 0000  .=stdin......Q..
00000030: 004f 0000 000f 0000 000b 0000 018b 0000  .O..............
00000040: 0001 0101 8081 0103 80c4 0003 0044 0000  .............D..
00000050: 0146 0001 0182 0484 6164 6404 8670 7269  .F......add..pri
00000060: 6e74 8101 0000 8180 8183 0200 0384 2201  nt............".
00000070: 0001 2e00 0106 4801 0200 4701 0100 8080  ......H...G.....
00000080: 8084 0100 0001 8082 8261 8084 8262 8084  .........a...b..
00000090: 808a 0102 fe04 0000 0000 0000 8080 8185  ................
000000a0: 5f45 4e56                                _ENV
```

Unfortunately I don't have the ability to highlight portions of the
code, but we can go through short sections at a time.

```
00000000: 1b4c 7561 5400 1993 0d0a 1a0a 0408 0878  .LuaT..........x
00000010: 5600 0000 0000 0000 0000 0000 2877 4001  V...........(w@.
```
Here's the function header, we can see at the end that the root
function has 1 upvalue, which is _ENV.

```
00000020: 873d 7374 6469 6e80 8000 0104 .=stdin.....
```

Here's the function header, we can see there are 6 characters in the
source name (indicated by the 0x87 byte), and that I compiled this
chunk by typing it in Luac's stdin. the next bytes are 0x80 and 0x80,
and that's because its the root function, so we ignore the lines
defined. It takes no parameters, and it is varags. It also needs at
least 4 positions on the stack

```
00000020:                               8a51 0000              .Q..
00000030: 004f 0000 000f 0000 000b 0000 018b 0000  .O..............
00000040: 0001 0101 8081 0103 80c4 0003 0044 0000  .............D..
00000050: 0146 0001 01                             .F...
```

The `0x8a` tells us that there are 10 instructions in the root
function, and the following 40 bytes are those instructions.

```
00000070:             82 0484 6164 6404 8670 7269       ...add..pri
00000060: 6e74                                     nt
```
There are two constants associated with the root function.

`0484 6164 64` means the first constant is of type 4 (string), is 4
characters long (actually 3 begins strings list 1 extra), and that the
constant is 'add'.

`04 8670 7269 6e74` tells us that the second constant is also a
string, is 5 characters long, and is 'print'.

```

00000060:      8101 0000   ....
```

There is one upvalue, it is inherited, and its the first upvalue of
the function we're inheriting from.

(As its the root function, and we're not loading this chunk inside of
any other chunk, there isn't really any function we're inheriting it
from, this is just where _ENV comes from)

```
00000060:                8180 8183 0200 0384 2201        ........".
00000070: 0001 2e00 0106 4801 0200 4701 0100 8080  ......H...G.....
00000080: 8084 0100 0001 8082 8261 8084 8262 8084  .........a...b..
00000090: 80                                       .
```

There is one nested function defined. This is the function prototype
for `add()`, Well talk about it after we finish the root function
prototype.

```
00000090:   8a 0102 fe04 0000 0000 0000 8080 ..............
```

There are 10 relative line numbers. The first instruction is generated
one line after the function is defined, the second is generated 2
lines after the that. The third instruction is generated negative 3
(0xFE) lines prior, and the next 4 lines after that.

(What's happening here is that line 3, the line ending the `add()`
function generates the `CLOSURE` instruction, but only after its been
instantiated can it be set as a global variable, by line 1 not
including the `local` keyword, hence the negative relative line
number.)

All remaining instructions (The next 6 0x00 bytes), are generated by
the same line.

`0x80` There are no AbsLineInfo entries.

`0x80` There are no local variables.

```
00000090:                                    8185                ..
000000a0: 5f45 4e56                                _ENV
```

There is one named upvalue, It's name is 4 characters long, and it's
name is _ENV.

### The Add() Function

Going back to the Add() function prototype,

```
00000060:                  80 8183 0200 03 ......
```

(I omitted the 0x81 byte as that was just the count of how many
function prototypes there were)

The function doesn't have a source name

It's defined on line 1 and ends on line 3

It takes 2 parameters, and is not varags

It needs at least 3 places on the stack,

```
00000060:                                 84 2201               .".
00000070: 0001 2e00 0106 4801 0200 4701 0100
```

The function has 4 instructions.

```
00000070:                                    8080                ..
00000080: 80
```

The function has 0 upvalues, 0 constants, and 0 function prototypes

```
00000080:   84 0100 0001 8082 8261 8084 8262 8084   ........a...b..
00000090: 80                                       .
```

There are 4 relative line numbers. The first instruction is generated
1 line after the function is defined, and the remaining 3 instructions
are generated on the same line.

There are 0 AbsLineInfo entries

There are 2 local variables. The first one is named 'a' and is comes
into existence at instruction 0 (i.e. It is not created by an
instruction and exists the moment the function is called), and stops
existing at instruction 4 (the end of the function. Remembers this
refers to the local variable, (the binding, if you will), not the
value, which persists outside of the function). The second one is
named 'b' and comes into being at instruction 0, ceasing to be at
instruction 4.

And there are no upvalues.

So there you have it, you should now understand the complete layout of
a binary chunk in Lua 5.4. I don't know why you'd find that useful,
but I wanted to share anyways.
