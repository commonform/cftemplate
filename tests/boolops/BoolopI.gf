incomplete concrete BoolopI of Boolop = open Prelude, LexBoolop in {
  lincat
    Exp = { s : Str ; b : Bool };
    CFtest, CFout = Str;
  lin
    And x y = { s = paren (x.s ++ " and " ++ y.s) ; b = andB x.b y.b } ;
    Or  x y = { s = paren (x.s ++ " or "  ++ y.s) ; b =  orB x.b y.b } ;
    Not   x = { s = paren (       "not "  ++ x.s) ; b = notB x.b     } ;
    Alpha   = { s = "top" ; b = True  } ;
    Beta    = { s = "bot" ; b = False } ;

    CF = CFtemplate;

  oper
    b2s : Bool -> Str;
    b2s x = if_then_Str x "True" "False";
}
      
      