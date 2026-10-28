package vn.speedcube.academy.catalog.repository;
import vn.speedcube.academy.catalog.model.PuzzleType;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PuzzleRepository extends JpaRepository<PuzzleType,String>{}
