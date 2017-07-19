
-- generate a bunch of tests for cftemplate boolean operations
-- the syntax: (( if exp begin ))
-- exp ::= '(' exp ')'
-- exp ::= exp 'and' exp
-- exp ::= exp 'or' exp

-- usage: gt -depth | l

abstract Bool = {
  flags startcat = Exp;
  cat Exp;
  fun
    And, Or :  Exp ->  Exp -> Exp;
    Paren   :  Exp -> Exp;
    Alpha, Beta : Exp;
}
        


