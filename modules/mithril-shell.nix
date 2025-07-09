inputs:
{
  config,
  lib,
  pkgs,
  ...
}:
let
  inherit (inputs) self;
  inherit (pkgs.hostPlatform) system;

  # Name that the systemd service for the bar will use.
  service-name = "mithril-shell";
  cfg = config.services.mithril-shell;

  hexColorType = lib.mkOptionType {
    name = "hex-color";
    descriptionClass = "noun";
    description = "RGB color in hex format";
    check = x: lib.isString x && !(lib.hasPrefix "#" x) && builtins.match "^[0-9A-Fa-f]{6}$" x != null;
  };
  mkHexColorOption =
    default:
    lib.mkOption {
      type = lib.types.coercedTo lib.types.str (lib.removePrefix "#") hexColorType;
      defaultText = "${defaultColors.${default}} or ${default} if 'integrations.stylix' is enabled";
      example = defaultColors.${default};
      description = "An individual colour of the mithril-shell theme.";
    };

  defaultColors = {
    base0C = "#94e2d5";
    base05 = "#cdd6f4";
    base00 = "#181825";
    base01 = "#1e1e2e";
    base02 = "#313244";
  };
in
{
  options.services.mithril-shell = with lib; {
    enable = mkOption {
      type = types.bool;
      default = false;
      description = ''
        Whether to enable mithril-shell. Does not automatically start the bar in your window manager.
      '';
    };

    package = mkOption {
      type = types.package;
      default = self.packages.${system}.mithril-shell;
      defaultText = lib.literalExpression "inputs.mithril-shell.packages.\${system}.mithril-shell";
      description = ''
        The mithril-shell package to use.
      '';
    };

    finalPackage = mkOption {
      type = types.package;
      readOnly = true;
      visible = false;
      description = ''
        The resulting mithril-shell package.
      '';
    };

    theme.colors = {
      primary = mkHexColorOption "base0C";
      text = mkHexColorOption "base05";
      background0 = mkHexColorOption "base00";
      background1 = mkHexColorOption "base01";
      surface0 = mkHexColorOption "base02";
    };

    settings = {
      animations = {
        activeWorkspace = mkOption {
          type = types.enum [
            "simple"
            "smooth"
          ];
          default = "smooth";
          example = "simple";
          description = ''
            The animation to display when changing the active workspace on the current monitor.
            - **simple:** only animate the old and new active workspace indicators.
            - **smooth:** run through all intermediate workspace indicators until reaching the new
              active indicator.
          '';
        };
      };

      bar.modules = {
        statusIndicators.batteryPercentage = mkOption {
          type = types.bool;
          default = true;
          description = ''
            Shows the current battery percentage in the bar. Set to false to disable. The battery
            percentage is never shown if no battery is detected.
          '';
        };
        workspacesIndicator.reverseScrollDirection = mkOption {
          type = types.bool;
          default = false;
          description = ''
            Reverse the scroll direction of the workspaces indicator, for all you natural
            scrollling users.
          '';
        };
      };

      lockCommand = mkOption {
        type = types.nullOr types.str;
        default = null;
        example = lib.literalExpression "\${pkgs.hyprlock}/bin/hyprlock --immediate";
        description = ''
          The command used to lock the screen. Set to null to disable.
        '';
      };

      minWorkspaces = mkOption {
        type = types.int;
        default = 3;
        example = 10;
        description = ''
          The minimum amount of workspaces to show regardless of if they are empty or not.
        '';
      };

      popups = {
        volumePopup.enable = mkOption {
          type = types.bool;
          default = true;
          example = true;
          description = ''
            When true, shows a small indicator popup whenever the default speaker volume changes.
          '';
        };
      };
    };

    integrations = {
      hyprland.enable = mkOption {
        type = types.bool;
        default = false;
        description = ''
          If enabled, autostarts the bar when hyprland launches.
        '';
      };

      stylix.enable = mkOption {
        type = types.bool;
        default = config.stylix.enable or false;
        description = ''
          If enabled, uses the stylix color scheme as default for 'theme.colors'.
        '';
      };
    };
  };

  config = lib.mkIf cfg.enable {
    # The systemd user service that is in charge of running the bar. It needs to be manually started
    # by your desktop environment.
    systemd.user.services.${service-name} = {
      Unit = {
        Description = "Mithril Shell";
        Documentation = "https://github.com/AndreasHGK/mithril-shell";
        PartOf = [ "graphical-session.target" ];
        After = [ "graphical-session-pre.target" ];
      };

      Service = {
        ExecStart = "${cfg.finalPackage}/bin/mithril-shell";
        Restart = "on-failure";
        KillMode = "mixed";
      };
    };

    wayland.windowManager.hyprland = lib.mkIf cfg.integrations.hyprland.enable {
      settings = {
        exec-once = [
          "systemctl --user restart ${service-name}"
        ];
      };
    };

    xdg.configFile = {
      "mithril-shell/settings.json".text = builtins.toJSON cfg.settings;
    };

    services.mithril-shell = {
      theme.colors =
        let
          colors =
            if cfg.integrations.stylix.enable && config.stylix.enable then
              config.lib.stylix.colors
            else
              defaultColors;
        in
        {
          primary = lib.mkOptionDefault colors.base0C;
          text = lib.mkOptionDefault colors.base05;
          background0 = lib.mkOptionDefault colors.base00;
          background1 = lib.mkOptionDefault colors.base01;
          surface0 = lib.mkOptionDefault colors.base02;
        };

      finalPackage =
        let
          generateThemeScss = colors: ''
            \$primary: #${colors.primary};
            \$text: #${colors.text};
            \$background0: #${colors.background0};
            \$background1: #${colors.background1};
            \$surface0: #${colors.surface0};
          '';

          agsConfig = pkgs.stdenvNoCC.mkDerivation {
            name = "ags-config";
            src = ../ags;
            allowSubstitutes = false;
            buildPhase = "true";
            installPhase = ''
              mkdir -p $out
              cp -r . $out
              echo "${generateThemeScss cfg.theme.colors}" > $out/theme.scss
            '';
          };
        in
        cfg.package.override {
          inherit agsConfig;
        };
    };
  };
}
