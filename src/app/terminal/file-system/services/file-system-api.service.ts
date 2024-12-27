import { Injectable } from '@angular/core';
import {Directory} from '../model/directory.model';
import {User} from '../model/user.model';
import {FsEntryExtendedAttributes} from '../model/fs-entry.model';
import {Permissions} from '../model/permissions.model';
import moment from 'moment';
import {File,  FileType} from '../model/file.model';
import * as md from '../files';

export enum SpecialFiles {
  cat = 'cat.md',
  cd = 'cd.md',
  echo = 'echo.md',
  groups = 'groups.md',
  ls = 'ls.md',
  pwd = 'pwd.md',
  whoami = 'whoami.md'
}

@Injectable({
  providedIn: 'root'
})
export class FileSystemApiService {
  readonly endOfFileSystem = new Directory('', moment(), undefined,
    new Permissions(new User('root'.padEnd(8, ' '), 'admin'), 'rwx', 'r-x', '---'));

  getFileSystem(): Directory {
    // Declare constants
    const mateuszbryll = new User('mateuszbryll', 'admin');
    const noAccessPermissions = new Permissions(mateuszbryll, 'rwx', 'r-x', '---');
    const defaultPermissions = new Permissions(mateuszbryll, 'rwx', 'r-x', 'r--');
    const executePermissions = new Permissions(mateuszbryll, 'rwx', 'r-x', 'r-x');
    const gitReleaseBranchAttr = { gitBranchName: 'release', showSshMetadata: false } as FsEntryExtendedAttributes;
    const gitRcBranchAttr = { gitBranchName: 'RC', gitHasUncommitedChanges: true, showSshMetadata: false } as FsEntryExtendedAttributes;
    const gitDevelopBranchAttr = { gitBranchName: 'develop', gitHasUncommitedChanges: true, showSshMetadata: false } as FsEntryExtendedAttributes;
    const gitFeatureBranchAttr = { gitBranchName: 'feature/browser', gitHasUncommitedChanges: false, showSshMetadata: false, position: 'Anonymous', positionStartDate: 'Jan 2003' } as FsEntryExtendedAttributes;
    const showSshMetadataAttr = { showSshMetadata: true } as FsEntryExtendedAttributes;
    const positionNetcomm = { position: 'Application developer', positionStartDate: 'Apr 2016' } as FsEntryExtendedAttributes;
    const positionForcom = { position: 'Senior developer', positionStartDate: 'Jul 2017' } as FsEntryExtendedAttributes;
    const positionTekutech = { position: 'Lead developer', positionStartDate: 'Nov 2019' } as FsEntryExtendedAttributes;
    const positionAllegro = { position: 'Manager, Engineering', positionStartDate: 'Sep 2022' } as FsEntryExtendedAttributes;
    const positionSide = { position: 'Self-learner', positionStartDate: 'Jan 1993' } as FsEntryExtendedAttributes;

    // Declare helper function
    let addProjectStructure = (parent: Directory) => {
      let git = new Directory('.git', moment(), parent, noAccessPermissions);
      let gitignore = new File('.gitignore', FileType.Regular, moment(), noAccessPermissions, '')
      let src = new Directory('src', moment(), parent, noAccessPermissions);
      let deploy = new Directory('deploy', moment(), parent, noAccessPermissions);
      let tests = new Directory('tests', moment(), parent, noAccessPermissions);

      parent.addDirectory(git);
      parent.addDirectory(src);
      parent.addDirectory(deploy);
      parent.addDirectory(tests);
      parent.addFile(gitignore);
    }

    // Add special files (manuals for commands) to endOfFileSystem
    this.endOfFileSystem.addFile(new File(SpecialFiles.cat, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.CAT.default));
    this.endOfFileSystem.addFile(new File(SpecialFiles.cd, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.CD.default));
    this.endOfFileSystem.addFile(new File(SpecialFiles.echo, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.ECHO.default));
    this.endOfFileSystem.addFile(new File(SpecialFiles.groups, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.GROUPS.default));
    this.endOfFileSystem.addFile(new File(SpecialFiles.ls, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.LS.default));
    this.endOfFileSystem.addFile(new File(SpecialFiles.pwd, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.PWD.default));
    this.endOfFileSystem.addFile(new File(SpecialFiles.whoami, FileType.Regular, moment(), this.endOfFileSystem.permissions, md.WHOAMI.default));

    // Build file system tree
    let root = new Directory('~', moment(), this.endOfFileSystem, defaultPermissions, showSshMetadataAttr);

    let resume = new Directory('Resume', moment(), root, defaultPermissions, showSshMetadataAttr);
    resume.addFile(new File('Education.md', FileType.Regular, moment('8/20/2019 17:27'), defaultPermissions, md.Education.default));
    resume.addFile(new File('About.md', FileType.Regular, moment(), defaultPermissions, md.About.default));
    root.addDirectory(resume);

    let projects = new Directory('Projects', moment(), resume, defaultPermissions, showSshMetadataAttr);
    resume.addDirectory(projects);

    let netcomm = new Directory('NetComm', moment('5/31/2017 14:17'), projects, defaultPermissions, { ...gitReleaseBranchAttr,  ...positionNetcomm });
    addProjectStructure(netcomm);
    netcomm.addFile(new File('JPK.md', FileType.Regular, moment('11/18/2016 11:52'), defaultPermissions, md.JPK.default));
    netcomm.addFile(new File('Scada.md', FileType.Regular, moment('5/31/2017 14:17'), defaultPermissions, md.Scada.default));
    projects.addDirectory(netcomm);

    let forcom = new Directory('Forcom', moment('10/31/2019 16:39'), projects, defaultPermissions, { ...gitReleaseBranchAttr,  ...positionForcom });
    addProjectStructure(forcom);
    forcom.addFile(new File('EverydayShoppingProgram.md', FileType.Regular, moment('4/28/2019 13:02'), defaultPermissions, md.EverydayShoppingProgram.default));
    forcom.addFile(new File('SilverlightMigration.md', FileType.Regular, moment('10/31/2019 16:39'), defaultPermissions, md.SilverlightMigration.default));
    forcom.addFile(new File('PingoDoce.md', FileType.Regular, moment('10/31/2019 16:39'), defaultPermissions, md.PingoDoce.default));
    forcom.addFile(new File('TestEnvironment.md', FileType.Regular, moment('7/20/2018 14:30'), defaultPermissions, md.TestEnvironment.default));
    forcom.addFile(new File('Perspectiv.md', FileType.Regular, moment('12/31/2018 09:14'), defaultPermissions, md.Perspectiv.default));
    projects.addDirectory(forcom);

    let tekutech = new Directory('TekuTech', moment('7/31/2022 15:17'), projects, defaultPermissions, { ...gitReleaseBranchAttr,  ...positionTekutech });
    addProjectStructure(tekutech);
    tekutech.addFile(new File('Saltrex.md', FileType.Regular, moment('1/15/2021 10:34'), defaultPermissions, md.Saltrex.default));
    tekutech.addFile(new File('ComponentsLibrary.md', FileType.Regular, moment('7/31/2022 14:58'), defaultPermissions, md.ComponentsLibrary.default));
    projects.addDirectory(tekutech);

    let allegro = new Directory('AllegroPay', moment(), projects, defaultPermissions, { ...gitDevelopBranchAttr,  ...positionAllegro });
    addProjectStructure(allegro);
    allegro.addFile(new File('AntiUsury.md', FileType.Regular, moment('5/18/2023'), defaultPermissions, md.AntiUsury.default));
    allegro.addFile(new File('PeselFreeze.md', FileType.Regular, moment('7/1/2024'), defaultPermissions, md.PeselFreeze.default));
    allegro.addFile(new File('BAU.md', FileType.Regular, moment(), defaultPermissions, md.BAU.default));
    projects.addDirectory(allegro);

    let skills = new Directory('Skills', moment(), resume, defaultPermissions, showSshMetadataAttr);
    skills.addFile(new File('Backend.md', FileType.Regular, moment(), defaultPermissions, md.Backend.default));
    skills.addFile(new File('Frontend.md', FileType.Regular, moment(), defaultPermissions, md.Frontend.default));
    skills.addFile(new File('DevOps.md', FileType.Regular, moment(), defaultPermissions, md.DevOps.default));
    skills.addFile(new File('Management.md', FileType.Regular, moment(), defaultPermissions, md.Management.default));
    skills.addFile(new File('KnowledgeSharing.md', FileType.Regular, moment(), defaultPermissions, md.KnowledgeSharing.default));
    resume.addDirectory(skills);

    let experience = new Directory('Experience', moment('9/1/2022 08:27'), resume, defaultPermissions, showSshMetadataAttr);
    experience.addFile(new File('Netcomm.md', FileType.Regular, moment('5/31/2017 16:17'), defaultPermissions, md.Netcomm.default));
    experience.addFile(new File('Forcom.md', FileType.Regular, moment('10/31/2019 18:29'), defaultPermissions, md.Forcom.default));
    experience.addFile(new File('Tekutech.md', FileType.Regular, moment('8/1/2022 09:45'), defaultPermissions, md.Tekutech.default));
    experience.addFile(new File('Allegropay.md', FileType.Regular, moment('9/1/2022 08:27'), defaultPermissions, md.Allegropay.default));
    experience.addFile(new File('_Chronology.md', FileType.Regular, moment('9/1/2022 09:03'), defaultPermissions, md.Chronology.default));
    resume.addDirectory(experience);

    return root;
  }
}
