dev:
    zellij --layout dev-layout.zellij
run:
    cd ./frontend && npm run build
    cd ./backend && cargo run
