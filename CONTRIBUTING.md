# Contributing to Videodock projects

## Table of contents

 - [Issues and Bugs](#found-an-issue)
 - [Submission Guidelines](#submitting-an-issue)
 - [Pull Request Guidelines](#submitting-a-pull-request)
 - [Commit Message Guidelines](#git-commit-guidelines)

## Found an Issue?
If you find a bug in the source code or a mistake in the documentation, create an [issue](https://bitbucket.org/videodock/ce-api/issues)
In the desciption mention the following topics:

* **Overview of the Issue** - If an error is being thrown, a non-minified stack trace helps.
* **Motivation or Use Case** - Explain why this is a bug for you.
* **Library Name and Version(s)** - Please indicate if it is a regression bug.
* **Browsers and Operating System** - Is this a problem with all browsers or only IE?
* **Reproduce the Error** - Please provide an unambiguous set of steps to reproduce the issue.
* **Suggest a Fix** - If you can't fix the bug yourself, perhaps you can point to what might be causing the problem (line of code or commit).

### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Make your changes in a new git branch:

    ```shell
    git checkout -b my-fix-branch master
    ```

* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#git-commit-guidelines). Adherence to the [commit message conventions](#git-commit-guidelines) is required because release notes are automatically generated from these messages.

    ```shell
    git commit -a
    ```

    > Note: The optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Push your branch to git:

    ```shell
    git push origin HEAD
    ```

* In Bitbucket, send a Pull Request to the master branch.
* If we suggest changes then:
    * Make the required updates.
    * Re-run the test suite to ensure tests are still passing.
    * Rebase your branch and force push to your repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

## Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The subject line of the commit message cannot be longer 100 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

### Type

Please use one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **doc**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope

The scope could be anything specifying the location of the commit change. For example `view-compiler` or `logger`.

### Subject

The subject contains a succinct description of the change:

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize the first letter.
* Do not add a dot (.) at the end.

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.