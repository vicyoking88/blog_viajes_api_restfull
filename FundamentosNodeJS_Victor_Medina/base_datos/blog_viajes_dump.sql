-- MariaDB dump 10.17  Distrib 10.4.14-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: blog_viajes
-- ------------------------------------------------------
-- Server version	10.4.14-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `autores`
--

DROP TABLE IF EXISTS `autores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `autores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `pseudonimo` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autores`
--

LOCK TABLES `autores` WRITE;
/*!40000 ALTER TABLE `autores` DISABLE KEYS */;
INSERT INTO `autores` VALUES (1,'luis@email.com','123123','luis2000',NULL),(2,'ana@email.com','123123','a55555',NULL),(20,'pedro@email.com','123456','pedro111',NULL),(25,'victor@email.com','123123','victorM','25.png'),(26,'valfonsomc4@gmail.com','123123','valfonso1',NULL),(27,'nigh4@hotmail.com','123123','noche1',NULL),(28,'aquiles@email.com','123123','aquiles1',NULL),(29,'akiles@email.com','123123','akiles2000',NULL),(30,'algo@algo.com','123123','algo2020',NULL),(31,'kldjflko@algo.com','123123','algo2020sdfdsf',NULL),(35,'AQUILES@hotmail.com','123123','AQUILES02',NULL),(36,'AQULES@hotmail.com','7777','AQUILES023',NULL);
/*!40000 ALTER TABLE `autores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicaciones`
--

DROP TABLE IF EXISTS `publicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `publicaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `resumen` varchar(255) NOT NULL,
  `contenido` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `votos` int(11) DEFAULT 0,
  `fecha_hora` timestamp NULL DEFAULT NULL,
  `autor_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_publicaciones_autores_idx` (`autor_id`),
  CONSTRAINT `fk_publicaciones_autores` FOREIGN KEY (`autor_id`) REFERENCES `autores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones`
--

LOCK TABLES `publicaciones` WRITE;
/*!40000 ALTER TABLE `publicaciones` DISABLE KEYS */;
INSERT INTO `publicaciones` VALUES (1,'Roma','Buen viaje a Roma','Contenido',NULL,0,'2018-09-10 01:08:27',1),(2,'Grecia','Buen viaje a Grecia','Contenido</p>',NULL,0,'2018-09-11 01:08:27',1),(3,'Paris','Buen viaje a Paris','Contenido',NULL,0,'2018-09-12 01:08:27',1),(4,'Costa Rica','Buen viaje a Costa Rica','Contenido',NULL,0,'2018-09-13 01:08:27',2),(5,'Mar de Plata','Buen viaje a Mar de Plata','Contenido',NULL,0,'2018-09-14 01:08:27',2),(6,'Guadalajara','Buen viaje a Guadalajara','Contenido',NULL,0,'2018-09-15 01:08:27',2),(7,'China','Buen viaje a China','Contenido',NULL,2,'2018-09-16 01:08:27',2),(16,'panama','Hola panama','<p>Nuestro viaje a <strong>panama</strong></p>',NULL,5,'2020-12-26 05:00:00',2),(19,'New York','traveling for new york','<p>algun dia<strong> ire</strong></p>',NULL,2,'2021-01-10 05:00:00',25),(21,'colombia','viaje inolvidable','en mi hogar',NULL,0,NULL,27),(23,'peru','viaje a peru','buen viaje a peru',NULL,0,NULL,27),(24,'peru','viaje a peru','buen viaje a peru 2',NULL,0,NULL,27),(25,'peru','viaje a peru','buen viaje a peru 3',NULL,0,NULL,27),(26,'peru','viaje a peru','buen viaje a peru 4',NULL,0,NULL,27),(27,'peru','viaje a peru','buen viaje a peru 4',NULL,0,NULL,27),(28,'peru','viaje a peru','buen viaje a peru 4',NULL,0,NULL,27),(29,'peru','viaje a peru','buen viaje a peru 4',NULL,0,NULL,27),(30,'peru','viaje a peru','buen viaje a peru 5',NULL,0,NULL,27),(32,'bucaramanga','viaje a bucaramanga','visitando la familia',NULL,0,NULL,27),(33,'argentina','viajando a argentina','excelente viaje',NULL,0,NULL,1);
/*!40000 ALTER TABLE `publicaciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-14 22:20:57
