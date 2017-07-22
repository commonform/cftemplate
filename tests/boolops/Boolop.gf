
-- generate a bunch of tests for cftemplate boolean operations
-- the syntax: (( if exp begin ))
-- exp ::= '(' exp ')'
-- exp ::= exp 'and' exp
-- exp ::= exp 'or' exp

-- usage: gt -depth | l

abstract Boolop = {
  flags startcat = CFtest;
  cat Exp; CFtest; CFout;
  fun
    And, Or     : Exp -> Exp -> Exp;
    Not         : Exp -> Exp;
    Alpha, Beta : Exp;
    CFt         : Exp -> CFtest;
    CFo         : Exp -> CFout;
}
        


