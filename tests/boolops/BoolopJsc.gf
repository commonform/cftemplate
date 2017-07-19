concrete BoolopJsc of Boolop = open Prelude in {
  lincat
    Exp = { s : Str ; b : Bool };
    CFtest = Str;
  lin
    And x y = { s = paren (x.s ++ " and " ++ y.s) ; b = andB x.b y.b } ;
    Or  x y = { s = paren (x.s ++ " or "  ++ y.s) ; b =  orB x.b y.b } ;
    Not   x = { s = paren (       "not "  ++ x.s) ; b = notB x.b     } ;
    Alpha   = { s = "top" ; b = True  } ;
    Beta    = { s = "bot" ; b = False } ;

    CF x = x.s ++ " is (( if " ++ x.s ++ " begin ))" ++ (b2s x.b) ++ "(( end ))(( unless " ++ x.s ++ " begin ))wrong!((end))";

  oper
    b2s : Bool -> Str;
    b2s x = if_then_Str x "True" "False";
}
      
      