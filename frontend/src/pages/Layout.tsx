import { Outlet } from "react-router-dom";
import { HeaderTabs } from "./Header";
import { AppShell, MantineProvider, useMantineTheme } from "@mantine/core";

// base layout for the website
// all over webpages will be overlayed on top
const Layout = () =>
{
  const theme = useMantineTheme();

  return (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <AppShell
        styles={ {
          main: {
            background: theme.colorScheme === 'dark' ? theme.colors.dark[ 8 ] : theme.colors.gray[ 0 ],
          },
        } }
        fixed
        header={ <HeaderTabs /> }
      >
        <Outlet />
      </AppShell >
    </MantineProvider>
  );
};

export default Layout;
