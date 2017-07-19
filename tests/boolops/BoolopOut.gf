instance BoolopOut of Boolop = open Prelude in
  {
  oper CFtemplate x = x.s ++ " is " ++ (b2s x.b);
}
