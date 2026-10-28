package vn.speedcube.academy.catalog.repository;
import vn.speedcube.academy.catalog.model.AlgorithmSet;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SetRepository extends JpaRepository<AlgorithmSet,String>{}
