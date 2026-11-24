-- Opcional (não é migration): usuário exclusivo do site, que só insere em landing_visits.
-- Ajuste o nome do banco e a senha. Exige um usuário administrador do MySQL.
CREATE USER 'kwty_tracker'@'%' IDENTIFIED BY 'SENHA_FORTE_AQUI' REQUIRE SSL;
GRANT INSERT ON nome_do_banco.landing_visits TO 'kwty_tracker'@'%';
