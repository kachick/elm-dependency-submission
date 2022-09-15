# elm-dependency-submission

[![Test & Lint](https://github.com/kachick/elm-dependency-submission/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kachick/elm-dependency-submission/actions/workflows/ci.yml)

This GitHub Action send elm dependencies list to the [Dependency submission API](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/using-the-dependency-submission-api). Dependencies then appear in your repository's dependency graph.

## Example

```yaml
name: Send Elm dependencies
on:
  push:
    branches:
      - main

# The API requires write permission on the repository to submit dependencies
permissions:
  contents: write

jobs:
  elm-dependency-submission:
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v3
      - name: Run snapshot action
        uses: kachick/elm-dependency-submission@v1
        with:
            # Required: GITHUB_TOKEN will work. No needed PAT
            token: "${{ secrets.GITHUB_TOKEN }}"
            #
            # Optional: Default "elm.json". Change it if different in your repository
            elm-json-path: elm.json
```

You can see the working image at [here](https://github.com/kachick/elm-dependency-submission/network/dependencies). It is parsing [elm-example/elm.json](elm-example/elm.json).

<img src="./assets/snapshot.png?raw=true" alt="Example of snapshot" width=700>

## NOTE

Author is a newbie of elm-lang...
