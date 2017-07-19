
-- generate a bunch of tests for cftemplate boolean operations
-- the syntax: (( if exp begin ))
-- exp ::= '(' exp ')'
-- exp ::= exp 'and' exp
-- exp ::= exp 'or' exp

-- usage: gt -depth | l

abstract Bool = {
  flags startcat = Exp;
  cat Exp; Atom;
  fun
    And, Or :  Exp ->  Exp -> Exp;
    Simple  : Atom -> Exp;
    Alpha, Beta : Atom;
}
        


