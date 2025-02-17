/* globals describe expect test */
import * as fsPath from 'node:path'

import {
  determineCurrentBranch,
  determineLocalMain,
  determineOriginAndMain,
  hasBranch,
  hasRemote,
  verifyIsOnBranch
} from '../branch-and-remotes-lib'

describe('determineCurrentBranch', () => {
  test.each([
    ['repo_a', 'main'],
    ['repo_b', 'work-branch']
  ])("'%s' is on branch '%s'", (repo, branch) =>
    expect(determineCurrentBranch({ projectPath : fsPath.join(__dirname, 'data', repo) })).toBe(branch))
})

describe('determineLocalMain', () => {
  test.each([['repo_a', 'main']])("'%s' -> has main branch '%s'", (repo, main) =>
    expect(determineLocalMain({ projectPath : fsPath.join(__dirname, 'data', repo) })).toBe(main))
})

describe('determineOriginAndMain', () => {
  test.each([
    ['repo_a_clone', 'origin', 'main'],
    ['repo_a_clone_2', 'upstream', 'main']
  ])("'%s' has origin / main '%s' / '%s'", (repo, origin, main) =>
    expect(determineOriginAndMain({ projectPath : fsPath.join(__dirname, 'data', repo) })).toEqual([origin, main]))
})

describe('hasBranch', () => {
  test.each([
    ['repo_a', 'main', true],
    ['repo_a', 'bar', true],
    ['repo_a', 'foo', false],
    ['repo_a_clone', 'origin/main', true]
  ])("'%s' has branch '%s' => %p", (repo, branch, present) =>
    expect(hasBranch({ branch, projectPath : fsPath.join(__dirname, 'data', repo) })).toBe(present))
})

describe('hasRemote', () => {
  test.each([
    ['repo_a', 'origin', false],
    ['repo_a_clone', 'origin', true],
    ['repo_a_clone_2', 'origin', false],
    ['repo_a_clone_2', 'upstream', true],
    ['repo_a_clone_2', 'coworker', true]
  ])("'%s' has remote '%s' => %p", (repo, remote, present) =>
    expect(hasRemote({ remote, projectPath : fsPath.join(__dirname, 'data', repo) })).toBe(present))

  test.each([
    ['repo_a', 'origin', 'repo_a(?:\\s|$)', false],
    ['repo_a_clone', 'origin', 'repo_a(?:\\s|$)', true],
    ['repo_a_clone_2', 'origin', 'repo_a(?:\\s|$)', false],
    ['repo_a_clone_2', 'upstream', 'repo_a(?:\\s|$)', true],
    ['repo_a_clone_2', 'coworker', 'repo_a_clone(?:\\s|$)', true]
  ])("'%s' has remote '%s' with url matching %p => %p", (repo, remote, urlMatch, present) =>
    expect(hasRemote({ remote, projectPath : fsPath.join(__dirname, 'data', repo), urlMatch })).toBe(present))
})

describe('verifyIsOnBranch', () => {
  test.each([
    ['repo_a', 'main', true],
    ['repo_a', 'bar', false],
    ['repo_a', 'not-a-branch', false],
    ['repo_b', 'work-branch', true]
  ])("'%s' is on branch '%s': %s", (repo, branch, result) => {
    const projectPath = fsPath.join(__dirname, 'data', repo)
    if (result === true) {
      expect(() => verifyIsOnBranch({ branch, projectPath })).not.toThrow()
    }
    else {
      expect(() => verifyIsOnBranch({ branch, projectPath })).toThrow(/not on branch/)
    }
  })

  test("works with 'branches'", () => {
    const projectPath = fsPath.join(__dirname, 'data', 'repo_b')
    let currBranch
    expect(() => { currBranch = verifyIsOnBranch({ branches : ['main', 'work-branch'], projectPath }) }).not.toThrow()
    expect(currBranch).toBe('work-branch')
  })
})
