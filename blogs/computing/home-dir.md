---
title: An Impractical Guide to a Perfect* Home Directory
date: 2024-01-13
contents: true
---

## Introduction

I won't start this post with the cliche spiel about how "The home
directory is one of the most important locations for any linux user".
(as I imagine this sort of post on, medium.com, or a video essay might
start) Or as a rant you've heard before about how dotfiles were a
mistake. If you're here and reading this, there's a good chance you
already agree with whatever statements I would say in an introduction.
And there's a good chance that, for some reason or another, you'd like
some advice on how to not have so many hidden files and folders in
`$HOME`.

> Or you're just here because I asked you to check out my post. In
> which case, I appreciate you going through the effort to read it. <3

Whatever your or my justifications are for wanting a cleaner home
directory, evidently, cleaning up the home directory is not an easy
task. The XDG base directory specification helps with this to *some*
extent, but there are **many** programmes that ignore it, or only
partially use it, so this post exists to detail the programmes that I
use and the tricks required to keep them from putting junk in `~/`.

---
## A Warning

The simple fact is, having a perfect home directory is not a simple
task, and you **will** have to make compromises in order to do it. The
more minimalist you are with the applications you use, the less
difficult the task is, but it does require a certain amount of OCD for
it to really feel worth it. So here is my warning: Don't do this. You
don't want a perfect home directory, its just a pain in the ass for
very little benefit. Too many applications just hard-code paths inside
of $HOME, and you can just pretend they don't exist by hiding
dotfiles. There are no rational reasons that I can think of for going
through the effort required to keep your home directory clean.

However, that doesn't mean close this page *immediately*. The effort
required increases the more you aim for perfection, but even just a
slightly cleaner home directory can be achieved without too much
effort.

---
## The Essentials

Are you still here? Okay. Let's start with the essentials. These are
the tools and tricks that will apply to cleaning up many different
applications. If an application doesn't have specific instructions
later in this post, one of these might be what you need. Some of the
applications later on will also just refer back to one of these, in
which case I've listed it as its something people may be specifically
looking for and I've already tried and found it to be the best
solution.

### XDG_CONFIG_HOME (and other XDG dirs)

This is a fairly obvious one, but for the sake of completeness, I
thought I ought to include it. The XDG base directory specification is
a specification declaring a set of environment variables that
programmes can use to know where to store certain kinds of data. A
programme should put its configuration files within the folder pointed
to by `$XDG_CONFIG_HOME`, all its cache files in the folder pointed to
by `$XDG_CACHE_HOME`, etc. A lot of programmes will try to use these
variables, and only fall back to the home directory in the case that
they haven't been set. For me personally, my XDG variables look like
this:

- `$XDG_CONFIG_HOME=/home/kaitlyn/.config`
- `$XDG_DATA_HOME=/home/kaitlyn/.local/share`
- `$XDG_STATE_HOME=/home/kaitlyn/.local/state`
- `$XDG_CACHE_HOME=/home/kaitlyn/.local/cache`
- `$XDG_BIN_HOME=/home/kaitlyn/.local/bin`

> I don't think I've ever actually seen `$XDG_BIN_HOME` used before;
> and it's not mentioned in the standard. But past me put it inside my
> `.zshenv` for one reason or another, so I decided to list it here.

These are fairly standard locations to set them to. Although,
`$XDG_CACHE_HOME` is typically put directly in the home directory
under the `.cache` folder. Trying to move `.local` and `.config` to
somewhere else is a task that not even I wanted to dare try and
handle: Plenty of programmes completely ignore the XDG specification,
but at least have the grace to hard-code `$HOME/.config` or something
similar, so I decided that I would accept them being there as my only*
dotfiles.

> besides, I actually quite like the `.local` and `.config` folders. I
> don't despise the idea of dotfiles, I just want less files in
> general in my home directory, and if I could have it completely my
> way, it would probably be organised pretty much the same, if only
> with slightly different folder names.

*except one other, but I'll get to that

### Application Jail

Some programmes are too important to go without, but have paths
hard-coded into them that there's nothing we can do about. In a
different universe where I have more time on my hands and am even more
obsessive about a clean home directory, I would fork these programmes
(at least the open source ones), and force them to use the right paths
but even that wouldn't solve the problem as even (especially) some
closed-source programmes are guilty, and we can't change those. In
this case, we need to resort to the application jail:

```sh
#!/usr/bin/env sh
HOME="$XDG_DATA_HOME/$(basename $1)" $@
```

This is a simple shell script that launches an application, but, for
that application only, moves $HOME to somewhere else, keeping any
files placed inside of it outside your actual home. I tend to keep
this script in my path under the name `jail`, and then make aliases
for other programmes to run through here instead, i.e. `alias
discord='jail discord'`.

The downsides to this are that any benign uses of `$HOME` in the
application are now moved there too. i.e. If you're using it for a
browser, you may need to manually set a location for downloaded files,
so that they got to `~/Downloads` instead of `<fake home>/Downloads`;
The file chooser will also open in a less convenient place, and so on.
But these are the compromises we accepted when we decided to make a
clean home directory.

### Sweep it under the rug

Sometimes the application jail won't work. For example, a programme
may be used by several other programmes and it's not entirely clear
how you're supposed to wrap it in a script. For me this was the case
with dconf. This programme wouldn't have been a problem if I had
chosen to keep `.cache`, as it did correctly use `.config`, but every
time I started up my computer, it would generate an entry in `.cache`.
However, it seemed not to screw anything up when I deleted this file,
and it was the only programme left putting anything in `.cache`, so I
quietly added a line to my window manager configuration to make it
delete the folder when it starts up.

This is, of course, a last resort sort of option. I searched for a
good while trying to find a way to stop the file being created, but
after finding nothing, this is the best solution I could come up with.

The generalisation of this is simply having something automatically
delete or move the unwanted files before you ever see them, this can
be in WM startup, shell startup, wherever you want to put it. It
doesn't solve the problem but it lets us pretend that we did, like
we're simply sweeping the unwanted files under a rug.

### Concessions

The last essential tool is both the least helpful and the most
helpful; At the same time, for some people it will be the easiest
step, whilst for others it will be the hardest: The ability to give
up. Some things are simply not possible or not worth it to move or
clean up, and you have to be able to make concessions about what may
and may not live in your home directory. My concessions where thus:

- `.config` and `.local` need to stay. I really didn't have much
  problem with doing this. It may have been nice to remove the dot in
  the name, but either way I'd have them *somewhere* in my home
  directory, so it didn't really bother me.

- `.zshenv` needs to stay. This is the only other dotfile in my home
  directory, but there's nothing I know that I can do about it.
  Wrapping zsh in the jail script would not only be a royal pain (I
  don't even want to think about giving the wrapped zsh to chsh), but
  having a fake home with my shell would almost defeat the point of
  the real home entirely, and cause more inconvenience than I'm
  willing to accept. So it has to stay, if only to tell zsh where to
  look for my real configuration.

There is another kind of concession you may want to make, which is
choosing not to use an application because its just too much of a pain
to stop it putting stuff in your home directory. The application jail
means that you rarely need to consider making this concession, but the
fact that I tend to be fairly conservative in what programmes I
install has certainly helped me. Trying to find the right tricks for
different various different programmes is one of the most time
consuming and frustrating parts of the process, espicially when you
find out they just don't exist. My point is this: you can make the
choice between allowing a bit of mess in the home directory, and just
not using an application.

My personal recommendation would be the former: Having a
(subjectively) clean home directory is a far more manageable and
reasonable goal than going the extra mile for a perfect one.
Unfortunately I don't take my own advice.


These four methods (XDG specification, application jail, pretending
the files never existed, and giving up) are applicable to almost every
application,

> Well, the fourth method actually covers everything, but that
> defeats the point a little.

But some applications may have their own specific methods for setting
where they store files, which may be easier, or come with less
compromises than something like spoofing the home directory, or
constantly deleting the files it generates. Usually these come in the
form of other environment variables to set. The rest of this post is
dedicated to covering all the application specific ways of cleaning up
the home directory.

---
## Programmes

### Bat

The `$BAT_CACHE_PATH` variable points to the **folder** where all
cache files should be stored.

e.g. `BAT_CACHE_PATH=$XDG_CACHE_HOME/bat/`.

<br/>

The `$BAT_CONFIG_PATH` variable points to the **file** containing
bat's configuration. This does **not** include the themes folder,
which is also typically stored in `~/.config/bat/themes/`.

e.g. `BAT_CONFIG_PATH=$XDG_CONFIG_HOME/bat/config`.

<br/>

The `$BAT_CONFIG_DIR` variable points to the **folder** containing
bat's themes folder, and, if `$BAT_CONFIG_PATH` is not set, bat's
configuration file.

e.g. `BAT_CONFIG_DIR=$XDG_CONFIG_HOME/bat/`

### Chromium (inc. Electron apps)

Chromium will generate a `$HOME/.pki/` folder upon starting up. The
best solution I have found to this is the [application
jail](#application-jail)

### Firefox

Chromium will generate a `$HOME/.mozilla/` folder upon starting up.
This is where it stores plugins and profiles etc. Profiles can be
moved out of here using Firefox's profile manager, but there appears
to be no way to move / remove `.mozilla` entirely. The best solution I
have found is the [application jail](#application-jail)

### GnuPG

The `$GNUPGHOME` variable points to the **folder** contaning your
gnupg files, which is by default `~/.gnupg`.

e.g. `GNUPGHOME=$XDG_DATA_HOME/gnupg/`

### Haskell

#### Cabal

The `$CABAL_DIR` variable points to the **folder** where cabal stores
its data, which is `~/.cabal/` by default.

e.g. `CABAL_DIR=$XDG_DATA_HOME/cabal/`

#### GHCup

The `$GHCUP_USE_XDG_DIRS` tells GHCup to use XDG dirs to store data,
instead of the home directory.

e.g. `GHCUP_USE_XDG_DIRS=1`

<br/>

The `$GHCUP_INSTALL_BASE_PREFIX` tells the GHCup installer the prefix
before the `.ghcup/` folder that it installs GHCup to, which is `~/`
by default.

e.g. `GHCUP_INSTALL_BASE_PREFIX=$XDG_DATA_HOME/`

#### Stack

The `$STACK_ROOT` variable points to the **folder** where stack stores
its data, which is `~/.stack/` by default.

e.g. `CABAL_DIR=$XDG_DATA_HOME/stack/`

### Home Manager

#### home.pointerCursor

For backwards compatibility sake, when setting `home.pointerCursor`,
Home Manager will create an entry in `~/.local/share/icons`, but also
symlink it into `~/.icons`. To disable this symlink, set:

```nix
home.file.".icons/default/index.theme".enable = false;
home.file.".icons/${config.home.pointerCursor.name}".enable = false;
```

### Nix

In your `nix.conf` file, you can set

```nix
use-xdg-base-directories = true;
```

Which will make Nix store files in `$XDG_STATE_HOME/nix/`.

On NixOS you can use `nix.settings.use-xdg-base-directories` in your
`configuration.nix` instead

### Npm

Npm will always generate a `$HOME/.npm/` folder. The best solution I
have found to this is the [application jail](#application-jail).

### Python

The `$PYTHONSTARTUP` variable points to a python file that should be
run first whenever the python interpreter starts up.

e.g. `PYTHONSTARTUP=$XDG_CONFIG_HOME/pythonrc`

<br/>

When used as a REPL, python calls the `readline.write_history_file`
function with the path `~/.python_history`.

This function can be changed in your python startup file. To have it
simply do nothing (i.e. disabling your history entirely), add to the
file:

```py
import readline
readline.write_history_file = lambda *args: None
```

Alternatively, if you still need your python history, this rc file
wraps all of the functions that use your history file and checks if
the path is `~/.python_history`. If it is, it quietly changes the path
to `$XDG_DATA_HOME/pyhist`.

```py
import readline
import os

_pyhist = {
    'read' : readline.read_history_file,
    'write' : readline.write_history_file,
    'append' : readline.append_history_file,
    'hp' : os.path.expanduser('~/.python_history'),
    'np' : os.path.join(os.environ['XDG_DATA_HOME'], 'pyhist'),
    'p' : lambda p: p if p != _pyhist['hp'] else _pyhist['np'],
}

readline.read_history_file = lambda path: \
        _pyhist['read'](_pyhist['p'](path))

readline.write_history_file = lambda path: \
        _pyhist['write'](_pyhist['p'](path))

readline.append_history_file = lambda n, path: \
        _pyhist['append'](n, _pyhist['p'](path))

```

The downside of this is of course that every time the python
interpreter runs, this will get run, meaning everything defined in
your pythonrc will be in your global scope, and `readline` and `os`
will be imported. I've reduced this as much as possible by keeping
everything within the single `_pyhist` variable, but in practice I've
never seen it cause any real problem so it should be fine.

### Readline

The `$INPUTRC` variable points to the **file** contaning your readline
keybinds, which is `~/.inputrc` by default.

e.g. `INPUTRC=$XDG_CONFIG_HOME/inputrc`

### Rust

#### Cargo

The `$CARGO_HOME` variable points to the **folder** containing cargo's
data, which is `~/.cargo/` by default.

e.g. `CARGO_HOME=$XDG_DATA_HOME/cargo/`

#### Rustup

The `$RUSTUP_HOME` variable points to the **folder** where rustup
installs stuff to, which is `~/.rustup/` by default.

e.g. `RUSTUP_HOME=$XDG_DATA_HOME/rustup/`

### SSH

> Moving `.ssh/` out of my home directory was the most difficult
> programme for me, It's also the one I have the least information
> about, purely because of my lack of experience with ssh. As such,
> the information here is mostly likely incomplete and/or innacurate,
> however, it has worked in moving my files, so I leave it here and
> may come back to it at a later date.

Inside of `/etc/ssh/ssh_config`, you can set `IdentityFile` to move
the `id_*` files from `~/.ssh/`, as well as `UserKnownHostsFile` to
move the `known_hosts.d/` folder.

e.g.
```
...

Host *
	IdentityFile ~/.local/share/ssh/id_rsa
	IdentityFile ~/.local/share/ssh/id_ed25519
	UserKnownHostsFile ~/.local/share/ssh/known_hosts.d/%k

...
```

#### SSHD

Inside of `/etc/ssh/sshd_config`, you can set `AuthorizedKeysFile` to
move the `authorized_keys` file.

e.g.
```
...

AuthorizedKeysFile /etc/ssh/authorized_keys.d/%u %h/.local/share/ssh/authorized_keys

...
```

### Starship

The `$STARSHIP_CACHE` variable points to the **folder** containing
starship log files.

e.g. `STARSHIP_CACHE=$XDG_CACHE_HOME/starship/`

<br/>

The `$STARSHIP_CONFIG` variable points to the **file** containing
starship configuration.

e.g. `STARSHIP_CONFIG=$XDG_CONFIG_HOME/starship.toml`

### Z.Lua

The `$_ZL_DATA` variable points to the **file** containing z.lua data,
which is `~/.zlua` by default.

e.g. `_ZL_DATA=$XDG_DATA_HOME/zlua`

### ZSH

The `$ZDOTDIR` variable points to the **folder** containing your ZSH
configuration files (i.e. `.zshrc`, `.zprofile`, etc.). You may have
to have a single `.zshenv` file in your home directory in order to set
this.

e.g. `ZDOTDIR=$XDG_CONFIG_HOME/zsh/`

## Notes

### Not Listed Here?

I've only been able to list the applications that I actually use, but
if you have figured out how to clean up any applications that aren't
listed here, let me know. You can do that via email or creating an
issue on the GitHub repo for this website.

