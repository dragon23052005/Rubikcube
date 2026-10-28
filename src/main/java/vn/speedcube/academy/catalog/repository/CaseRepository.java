package vn.speedcube.academy.catalog.repository;
import vn.speedcube.academy.catalog.model.AlgorithmCase;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CaseRepository extends JpaRepository<AlgorithmCase,String> {}
