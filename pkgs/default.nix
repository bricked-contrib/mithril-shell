inputs:
# An overlay of all the packages exported by the flake.
final: prev: {
  mithril-control-center = final.callPackage ./mithril-control-center {
    inherit (inputs.self.lib) readPatches;
  };
}
