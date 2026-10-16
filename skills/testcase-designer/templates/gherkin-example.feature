Feature: Password length on sign-up

  Scenario Outline: Password length boundaries
    Given I am on the sign-up page
    When I enter a password of <length> characters
    Then the password field is <state>

    Examples:
      | length | state    |
      | 7      | rejected |
      | 8      | accepted |
      | 64     | accepted |
      | 65     | rejected |
