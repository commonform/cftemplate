concrete BoolJsc of Bool = {
  lincat
    Exp = Str;
  lin
    And x y = x ++ " and " ++ y;
    Or  x y = x ++ " or"   ++ y;
    Paren x = "( " ++ x ++ " )";
    Alpha   = "top"; -- true
    Beta    = "bot"; -- false
}
      
      