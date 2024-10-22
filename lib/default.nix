self: {
  # Simple helper function to facilitate importing other modules in a home-manager (or nixos)
  # module.
  mkImports = paths: builtins.map (elem: import elem self) paths;
}
