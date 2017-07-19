concrete BoolJsc of Bool = {
  lincat
    Exp, Atom = Str;
  lin
    And x y = paren ( x ++ " and " ++ y );
    Or  x y = paren ( x ++ " or"   ++ y );
    Simple x = x;
    Alpha   = "top"; -- which shall be true
    Beta    = "bot";  -- which shall be false
  oper
    paren : Str -> Str;
    paren x = "( " ++ x ++ " )";
}
      
      